// Liefert die Zahlen für das Dashboard unter /auswertung.
//
// Der Browser spricht nie mit der Datenbank: auswertung.html ist eine statische
// Seite, alle Abfragen laufen über diese Function, und nur sie kennt
// DATABASE_URL. Ein Fehler in einer Freigaberegel könnte hier also nicht die
// Kontaktliste offenlegen.
//
// Anmeldung per Passwort, danach ein signierter httpOnly-Cookie. Der ist für
// einen ausdrücklich angeforderten Dienst technisch notwendig und liegt
// ausschließlich im Dashboard -- die öffentliche Seite bleibt cookiefrei.
//
// Benötigte Environment-Variablen in Vercel:
//   DATABASE_URL          Neon-Verbindung (Pflicht)
//   AUSWERTUNG_PASSWORT   Passwort für die Anmeldung (Pflicht)
//   AUSWERTUNG_SECRET     langer Zufallsstring zum Signieren (Pflicht)
//   SEITEN_URL            z. B. https://manereal.at (optional, sonst aus der Anfrage)
//   AUSWERTUNG_TIMEOUT_MIN  Minuten Ruhe bis zur erneuten Anmeldung (optional, Standard 10)

const crypto = require('crypto');
const { db } = require('./_db');
const { neuerToken } = require('./_token');

const COOKIE = 'auswertung';

// Ruhezeit bis zur erneuten Anmeldung. Der Cookie wird bei jeder Abfrage neu
// gesetzt, die Frist läuft also ab der letzten Tätigkeit und nicht ab der
// Anmeldung. Über AUSWERTUNG_TIMEOUT_MIN in Vercel änderbar: 480 sind acht
// Stunden. Unsinnige Werte fallen auf den Standard zurück, nach oben ist bei
// 30 Tagen Schluss.
function minutenOder(wert, standard) {
  const n = Number(String(wert == null ? '' : wert).trim());
  if (!Number.isFinite(n) || n < 1) return standard;
  return Math.min(Math.floor(n), 30 * 24 * 60);
}

const RUHE_MINUTEN = minutenOder(process.env.AUSWERTUNG_TIMEOUT_MIN, 10);
const GUELTIG_MS = RUHE_MINUTEN * 60 * 1000;
const MAX_CSV = 2 * 1024 * 1024;
const MAX_IMPORT = 5000;

// Anmeldeversuche begrenzen -- das Passwort ist der einzige Riegel.
const versuche = new Map();
const VERSUCH_FENSTER_MS = 60 * 1000;
const VERSUCH_MAX = 10;

function zuVieleVersuche(ip) {
  const jetzt = Date.now();
  const treffer = (versuche.get(ip) || []).filter((t) => jetzt - t < VERSUCH_FENSTER_MS);
  treffer.push(jetzt);
  versuche.set(ip, treffer);
  if (versuche.size > 500) versuche.clear();
  return treffer.length > VERSUCH_MAX;
}

/* --- Anmeldung ---------------------------------------------------------- */

function gleich(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

function hmac(nutzlast) {
  return crypto.createHmac('sha256', process.env.AUSWERTUNG_SECRET || '')
    .update(nutzlast).digest('base64url');
}

// Der Cookie trägt nur den Ablaufzeitpunkt und dessen Signatur. Nichts, was
// jemand umschreiben könnte, ohne das Geheimnis zu kennen.
function signiere(bis) {
  const nutzlast = String(bis);
  return nutzlast + '.' + hmac(nutzlast);
}

function angemeldet(req) {
  const roh = String(req.headers.cookie || '');
  const treffer = roh.split(';').map((s) => s.trim()).find((s) => s.startsWith(COOKIE + '='));
  if (!treffer) return false;
  const wert = decodeURIComponent(treffer.slice(COOKIE.length + 1));
  const punkt = wert.lastIndexOf('.');
  if (punkt < 1) return false;
  const nutzlast = wert.slice(0, punkt);
  if (!gleich(wert.slice(punkt + 1), hmac(nutzlast))) return false;
  return Number(nutzlast) > Date.now();
}

function setzeCookie(res, req, wert, alter) {
  const lokal = /^localhost|^127\.0\.0\.1|^\[::1\]/.test(String(req.headers.host || ''));
  res.setHeader('Set-Cookie', [
    COOKIE + '=' + encodeURIComponent(wert),
    'Path=/',
    'Max-Age=' + alter,
    'HttpOnly',
    'SameSite=Strict',
  ].concat(lokal ? [] : ['Secure']).join('; '));
}

/* --- Hilfsmittel -------------------------------------------------------- */

async function leseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const teile = [];
  let groesse = 0;
  for await (const teil of req) {
    groesse += teil.length;
    if (groesse > MAX_CSV) throw new Error('zu groß');
    teile.push(teil);
  }
  return JSON.parse(Buffer.concat(teile).toString('utf8') || '{}');
}

function text(wert, max) {
  return String(wert == null ? '' : wert).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

// null bedeutet "alle Kampagnen" -- die Abfragen prüfen darauf mit is null.
function kampagneOder(wert) {
  const k = text(wert, 80);
  return k && k !== 'alle' ? k : null;
}

function datumOder(wert) {
  const d = text(wert, 30);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

// Trennzeichen aus der Kopfzeile ableiten: Excel in deutscher Einstellung
// schreibt Semikolon, fast alles andere Komma. Die Spaltennamen bleiben in
// ihrer Originalschreibweise erhalten -- sie werden unverändert nach Instantly
// durchgereicht, dort sind Variablennamen groß-/kleinschreibungsempfindlich.
function csvLesen(roh) {
  const t = String(roh || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!t) return { spalten: [], saetze: [] };
  const kopfzeile = t.split('\n')[0];
  const trenner = kopfzeile.split(';').length > kopfzeile.split(',').length ? ';' : ',';

  const zeilen = [];
  let wert = '';
  let zeile = [];
  let inAnfuehrung = false;

  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (inAnfuehrung) {
      if (c === '"') {
        if (t[i + 1] === '"') { wert += '"'; i += 1; } else inAnfuehrung = false;
      } else wert += c;
    } else if (c === '"') inAnfuehrung = true;
    else if (c === trenner) { zeile.push(wert); wert = ''; }
    else if (c === '\n') { zeile.push(wert); zeilen.push(zeile); zeile = []; wert = ''; }
    else wert += c;
  }
  zeile.push(wert);
  zeilen.push(zeile);

  const spalten = zeilen.shift().map((s) => s.trim()).filter(Boolean);
  const saetze = zeilen
    .filter((z) => z.some((f) => f.trim()))
    .map((z) => {
      const satz = {};
      spalten.forEach((k, i) => { satz[k] = (z[i] || '').trim(); });
      return satz;
    });
  return { spalten, saetze };
}

// Zwei Ausgabeformate, weil zwei Ziele. Excel in deutscher Einstellung erwartet
// Semikolon und braucht das BOM, sonst zerfallen die Umlaute. Instantly
// verlangt Komma und reines UTF-8 -- ein BOM würde dort die erste Spalte zu
// "﻿Email" machen und das Zuordnen der Felder scheitern lassen.
const CSV_FORMAT = {
  excel: { trenner: ';', bom: true },
  instantly: { trenner: ',', bom: false },
};

function csvFeld(wert, trenner) {
  const s = String(wert == null ? '' : wert);
  return s.indexOf(trenner) >= 0 || /["\n\r]/.test(s)
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

function csvSchreiben(kopf, zeilen, art) {
  const f = CSV_FORMAT[art] || CSV_FORMAT.excel;
  const zeile = (felder) => felder.map((w) => csvFeld(w, f.trenner)).join(f.trenner);
  return (f.bom ? '﻿' : '')
    + [zeile(kopf)].concat(zeilen.map(zeile)).join('\r\n');
}

// Spalten werden unabhängig von Schreibweise, Bindestrichen und Leerzeichen
// erkannt, dazu unter den gängigen deutschen Namen. Wer "E-Mail" oder
// "Vorname" in der Kopfzeile stehen hat, muss nichts umbenennen.
const ALIASE = {
  email: ['email', 'mail', 'emailaddress', 'emailadresse'],
  firstname: ['firstname', 'vorname'],
  lastname: ['lastname', 'surname', 'nachname', 'familienname'],
  company: ['company', 'companyname', 'firma', 'unternehmen'],
  sent_at: ['sentat', 'senddate', 'versendet', 'versandt'],
};

function normal(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Liefert den Originalnamen der Spalte, die zu einem bekannten Feld gehört.
function spalteFuer(spalten, feld) {
  const namen = ALIASE[feld];
  return spalten.find((s) => namen.indexOf(normal(s)) >= 0) || null;
}

// Instantly verlangt Spaltennamen mit großem Anfangsbuchstaben und höchstens
// 20 Zeichen. Sonderzeichen fallen weg, damit der Variablenname gültig bleibt.
function instantlySpalte(roh) {
  const s = String(roh == null ? '' : roh).replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 20);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function seitenUrl(req) {
  const aus = text(process.env.SEITEN_URL, 200).replace(/\/+$/, '');
  if (aus) return aus;
  const host = text(req.headers.host, 200);
  const schema = /^localhost|^127\.0\.0\.1/.test(host) ? 'http' : 'https';
  return schema + '://' + host;
}

/* --- Abfragen ----------------------------------------------------------- */

// Trichter über PERSONEN, nicht über Besuche: Wer dreimal wiederkommt, soll die
// Klickrate nicht verdreifachen. Die Besuche ohne Zuordnung stehen daneben.
async function uebersicht(sql, kampagne, von, bis) {
  const p = [kampagne, von, bis];

  const [versendet] = await sql.query(
    'select count(*)::int as n from contacts where ($1::text is null or campaign = $1)',
    [kampagne],
  );

  const [trichter] = await sql.query(`
    with b as (
      select v.id, v.token, v.human
      from visits v
      where v.token is not null
        and ($1::text is null or v.campaign = $1)
        and ($2::date  is null or v.started_at >= $2::date)
        and ($3::date  is null or v.started_at < ($3::date + 1))
    ),
    w as (
      select e.visit_id,
             count(distinct e.route) filter (where e.type = 'route_enter') as routen,
             count(*) filter (where e.type = 'cta_click')                  as ctas,
             count(*) filter (where e.type = 'form_submit')                as formulare
      from events e join b on b.id = e.visit_id
      group by e.visit_id
    )
    select
      count(distinct b.token)::int                                                   as aufgerufen,
      count(distinct b.token) filter (where b.human)::int                            as mensch,
      count(distinct b.token) filter (where b.human and coalesce(w.routen, 0) >= 2)::int    as mehrseitig,
      count(distinct b.token) filter (where b.human and coalesce(w.ctas, 0) > 0)::int       as cta,
      count(distinct b.token) filter (where b.human and coalesce(w.formulare, 0) > 0)::int  as formular,
      count(*)::int                                                                  as besuche,
      count(*) filter (where not b.human)::int                                       as scanner
    from b left join w on w.visit_id = b.id
  `, p);

  const [ohne] = await sql.query(`
    select count(*)::int as besuche, count(*) filter (where human)::int as mensch
    from visits
    where token is null
      and ($1::date is null or started_at >= $1::date)
      and ($2::date is null or started_at < ($2::date + 1))
  `, [von, bis]);

  const kampagnen = await sql.query(`
    select c.campaign,
           count(distinct c.token)::int                             as versendet,
           count(distinct v.token)::int                             as aufgerufen,
           count(distinct v.token) filter (where v.human)::int      as mensch,
           count(distinct v.token) filter (where x.cta and v.human)::int      as cta,
           count(distinct v.token) filter (where x.formular and v.human)::int as formular,
           -- Lesezeit nur von Menschen: sonst stehen Scanner-Sekunden in einer
           -- Spalte neben Raten, die ausdrücklich ohne Scanner gerechnet sind.
           coalesce(sum(x.lesezeit) filter (where v.human), 0)::int as lesezeit
    from contacts c
    left join visits v on v.token = c.token
    left join (
      select e.visit_id,
             sum(e.dwell_ms) filter (where e.type = 'route_leave')  as lesezeit,
             bool_or(e.type = 'cta_click')                          as cta,
             bool_or(e.type = 'form_submit')                        as formular
      from events e group by e.visit_id
    ) x on x.visit_id = v.id
    group by c.campaign
    order by c.campaign
  `, []);

  return {
    versendet: versendet.n,
    trichter,
    ohneZuordnung: ohne,
    kampagnen,
  };
}

// Alle Kontakte der Kampagne, auch die ohne Besuch. Die stehen unten angereiht,
// damit die Klickrate ohne Rechnen vor Augen steht.
async function personen(sql, kampagne) {
  return sql.query(`
    select c.token, c.email, c.firstname, c.lastname, c.company, c.campaign, c.sent_at,
           coalesce(b.besuche, 0)::int   as besuche,
           b.erster, b.letzter,
           coalesce(b.mensch, false)     as mensch,
           coalesce(b.lesezeit, 0)::int  as lesezeit,
           coalesce(b.cta, false)        as cta,
           coalesce(b.formular, false)   as formular
    from contacts c
    left join (
      select v.token,
             count(distinct v.id)                as besuche,
             min(v.started_at)                   as erster,
             max(v.started_at)                   as letzter,
             bool_or(v.human)                    as mensch,
             -- wie bei den Kampagnen: Scanner-Sekunden bleiben draußen, sonst
             -- sortiert die Liste nach einer Zeit, die niemand gelesen hat
             coalesce(sum(x.lesezeit) filter (where v.human), 0) as lesezeit,
             bool_or(x.cta and v.human)          as cta,
             bool_or(x.formular and v.human)     as formular
      from visits v
      left join (
        select e.visit_id,
               sum(e.dwell_ms) filter (where e.type = 'route_leave') as lesezeit,
               bool_or(e.type = 'cta_click')                         as cta,
               bool_or(e.type = 'form_submit')                       as formular
        from events e group by e.visit_id
      ) x on x.visit_id = v.id
      where v.token is not null
      group by v.token
    ) b on b.token = c.token
    where ($1::text is null or c.campaign = $1)
    order by (b.besuche is null), b.lesezeit desc nulls last, c.lastname, c.firstname, c.email
  `, [kampagne]);
}

async function person(sql, token) {
  const [kontakt] = await sql.query(
    `select token, email, firstname, lastname, company, campaign, sent_at, optout_at, extra
     from contacts where token = $1`,
    [token],
  );
  if (!kontakt) return null;

  const besuche = await sql.query(`
    select id, started_at, human, signal, device, country, source
    from visits where token = $1 order by started_at
  `, [token]);

  const routen = await sql.query(`
    select e.visit_id, e.route, sum(e.dwell_ms)::int as ms, min(e.ts) as zuerst
    from events e join visits v on v.id = e.visit_id
    where v.token = $1 and e.type = 'route_leave' and e.route is not null
    group by e.visit_id, e.route
    order by min(e.ts)
  `, [token]);

  const ereignisse = await sql.query(`
    select e.visit_id, e.ts, e.type, e.route, e.meta
    from events e join visits v on v.id = e.visit_id
    where v.token = $1
      and e.type in ('cta_click', 'form_submit', 'form_error', 'faq_open', 'mail_click')
    order by e.ts
  `, [token]);

  return { kontakt, besuche, routen, ereignisse };
}

async function seiten(sql, kampagne) {
  const routen = await sql.query(`
    select e.route,
           count(distinct e.visit_id)::int as besuche,
           sum(e.dwell_ms)::int            as summe,
           round(avg(e.dwell_ms))::int     as mittel
    from events e join visits v on v.id = e.visit_id
    where e.type = 'route_leave' and e.route is not null and v.human
      and ($1::text is null or v.campaign = $1)
    group by e.route order by summe desc nulls last
  `, [kampagne]);

  const faq = await sql.query(`
    select e.meta->>'q' as frage, count(*)::int as anzahl
    from events e join visits v on v.id = e.visit_id
    where e.type = 'faq_open' and v.human and e.meta->>'q' is not null
      and ($1::text is null or v.campaign = $1)
    group by 1 order by 2 desc limit 25
  `, [kampagne]);

  const cta = await sql.query(`
    select coalesce(e.meta->>'cta', 'unbekannt') as stelle, e.route, count(*)::int as anzahl
    from events e join visits v on v.id = e.visit_id
    where e.type = 'cta_click' and v.human
      and ($1::text is null or v.campaign = $1)
    group by 1, 2 order by 3 desc
  `, [kampagne]);

  const signale = await sql.query(`
    select coalesce(signal, 'keins') as signal, count(*)::int as anzahl
    from visits
    where ($1::text is null or campaign = $1)
    group by 1 order by 2 desc
  `, [kampagne]);

  return { routen, faq, cta, signale };
}

// Legt die Kontakte an und gibt die Liste der Kampagne als Datei für Instantly
// zurück -- mit der Spalte "Token", aus der dort der Link zusammengebaut wird.
//
// Die Tokens in der Datei stammen immer aus der Datenbank, nie aus dem gerade
// erzeugten Satz. Ein versehentlich wiederholter Upload legt deshalb nichts
// doppelt an und liefert dieselben Tokens wie beim ersten Mal -- sonst zeigten
// die neuen Links auf Kontakte, die es gar nicht gibt.
async function importieren(sql, csv, kampagne) {
  if (!kampagne) {
    return { fehler: 'Es fehlt die Angabe, zu welcher Kampagne die Kontakte gehören.' };
  }

  const { spalten, saetze } = csvLesen(csv);
  if (!saetze.length) return { fehler: 'Die Datei enthält keine Zeilen.' };

  const sEmail = spalteFuer(spalten, 'email');
  if (!sEmail) {
    return {
      fehler: 'Es gibt keine Spalte mit E-Mail-Adressen. Sie ist Pflicht — auch Instantly '
        + 'verlangt sie. Erkannt werden unter anderem: email, E-Mail, mail.',
    };
  }

  const sVor = spalteFuer(spalten, 'firstname');
  const sNach = spalteFuer(spalten, 'lastname');
  const sFirma = spalteFuer(spalten, 'company');
  const sDatum = spalteFuer(spalten, 'sent_at');

  // Alles Übrige wird unverändert durchgereicht, damit in Instantly beliebig
  // personalisiert werden kann, ohne dass hier etwas anzupassen wäre.
  const bekannt = [sEmail, sVor, sNach, sFirma, sDatum].filter(Boolean);
  const zusatzSpalten = spalten.filter((s) => bekannt.indexOf(s) < 0);

  const werte = [];
  const params = [];
  let ohneAdresse = 0;

  for (const satz of saetze.slice(0, MAX_IMPORT)) {
    const email = text(satz[sEmail], 200).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { ohneAdresse += 1; continue; }

    const extra = {};
    zusatzSpalten.forEach((s) => { if (satz[s]) extra[s] = text(satz[s], 300); });

    const n = params.length;
    werte.push(
      `($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, $${n + 5}, $${n + 6}, $${n + 7}::date, $${n + 8}::jsonb)`,
    );
    params.push(
      neuerToken(),
      email,
      sVor ? text(satz[sVor], 120) : null,
      sNach ? text(satz[sNach], 120) : null,
      sFirma ? text(satz[sFirma], 160) : null,
      kampagne,
      sDatum ? datumOder(satz[sDatum]) : null,
      Object.keys(extra).length ? JSON.stringify(extra) : null,
    );
  }

  if (!werte.length) {
    return { fehler: 'Keine einzige Zeile enthielt eine gültige E-Mail-Adresse.' };
  }

  const [vorher] = await sql.query(
    'select count(*)::int as n from contacts where campaign = $1', [kampagne],
  );

  await sql.query(
    `insert into contacts (token, email, firstname, lastname, company, campaign, sent_at, extra)
     values ${werte.join(', ')}
     on conflict (email, campaign) do nothing`,
    params,
  );

  const inDb = await sql.query(
    `select token, email, firstname, lastname, company, extra
     from contacts where campaign = $1 order by created_at, email`,
    [kampagne],
  );

  // Spaltenreihenfolge: erst die der hochgeladenen Datei, dann alles, was aus
  // einem früheren Upload derselben Kampagne noch dazukommt.
  const zusatz = zusatzSpalten.slice();
  inDb.forEach((z) => {
    Object.keys(z.extra || {}).forEach((k) => { if (zusatz.indexOf(k) < 0) zusatz.push(k); });
  });

  const kopf = ['Email', 'Firstname', 'Lastname', 'Company', 'Token']
    .concat(zusatz.map(instantlySpalte).filter(Boolean));

  const zeilen = inDb.map((z) => [
    z.email, z.firstname || '', z.lastname || '', z.company || '', z.token,
  ].concat(zusatz.map((k) => (z.extra && z.extra[k]) || '')));

  const angelegt = inDb.length - vorher.n;

  return {
    angelegt,
    schonVorhanden: werte.length - angelegt,
    ohneAdresse,
    gesamt: inDb.length,
    spalten: kopf,
    csv: csvSchreiben(kopf, zeilen, 'instantly'),
  };
}

// Ergebnisdatei zum Nachlesen, nicht für Instantly: Semikolon und BOM, damit
// Excel sie ohne Umweg richtig öffnet.
async function exportieren(sql, kampagne, basis) {
  const liste = await personen(sql, kampagne);
  return csvSchreiben(
    ['vorname', 'nachname', 'unternehmen', 'email', 'kampagne', 'token', 'link',
      'besuche', 'mensch', 'lesezeit_sekunden', 'erstgespraech', 'formular'],
    liste.map((p) => [
      p.firstname || '', p.lastname || '', p.company || '', p.email, p.campaign,
      p.token, basis + '/?m=' + p.token,
      p.besuche, p.mensch ? 'ja' : 'nein', Math.round(p.lesezeit / 1000),
      p.cta ? 'ja' : 'nein', p.formular ? 'ja' : 'nein',
    ]),
    'excel',
  );
}

/* --- Verteiler ---------------------------------------------------------- */

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  const aktion = text(url.searchParams.get('a'), 20) || 'uebersicht';
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  const passwort = (process.env.AUSWERTUNG_PASSWORT || '').trim();
  const geheim = (process.env.AUSWERTUNG_SECRET || '').trim();
  if (!passwort || !geheim) {
    console.error('Auswertung: AUSWERTUNG_PASSWORT oder AUSWERTUNG_SECRET fehlt.');
    return res.status(500).json({ fehler: 'Nicht eingerichtet.' });
  }

  if (aktion === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ fehler: 'Nur POST.' });
    if (zuVieleVersuche(ip)) return res.status(429).json({ fehler: 'Zu viele Versuche. Bitte kurz warten.' });
    let body;
    try { body = await leseBody(req); } catch (err) { return res.status(400).json({ fehler: 'Unlesbar.' }); }
    if (!gleich(text(body.passwort, 200), passwort)) {
      return res.status(401).json({ fehler: 'Passwort stimmt nicht.' });
    }
    setzeCookie(res, req, signiere(Date.now() + GUELTIG_MS), Math.floor(GUELTIG_MS / 1000));
    return res.status(200).json({ ok: true });
  }

  if (aktion === 'logout') {
    setzeCookie(res, req, '', 0);
    return res.status(200).json({ ok: true });
  }

  if (!angemeldet(req)) return res.status(401).json({ fehler: 'Nicht angemeldet.' });

  // Gleitendes Fenster: Jede Abfrage schiebt die Frist nach vorn. Wer arbeitet,
  // bleibt angemeldet -- wer aufhört, gibt nach RUHE_MINUTEN das Passwort neu ein.
  setzeCookie(res, req, signiere(Date.now() + GUELTIG_MS), Math.floor(GUELTIG_MS / 1000));

  // Anwesenheit ohne Abfrage: Das Dashboard meldet damit Mausbewegung, Tippen
  // und Scrollen, ohne dafür die Datenbank zu behelligen.
  if (aktion === 'ping') return res.status(204).end();

  let sql;
  try {
    sql = db();
  } catch (err) {
    console.error('Auswertung:', err.message);
    return res.status(500).json({ fehler: 'Keine Datenbankverbindung.' });
  }

  const kampagne = kampagneOder(url.searchParams.get('kampagne'));
  const von = datumOder(url.searchParams.get('von'));
  const bis = datumOder(url.searchParams.get('bis'));

  try {
    if (aktion === 'uebersicht') {
      // ruheMinuten reist mit, damit der Browser dieselbe Frist kennt wie der
      // Server und die Zahl nur an einer Stelle gepflegt werden muss.
      const daten = await uebersicht(sql, kampagne, von, bis);
      return res.status(200).json(Object.assign({}, daten, { ruheMinuten: RUHE_MINUTEN }));
    }

    if (aktion === 'personen') {
      return res.status(200).json({ personen: await personen(sql, kampagne) });
    }

    if (aktion === 'person') {
      const token = text(url.searchParams.get('token'), 20).toUpperCase();
      const daten = await person(sql, token);
      if (!daten) return res.status(404).json({ fehler: 'Unbekannter Kontakt.' });
      return res.status(200).json(daten);
    }

    if (aktion === 'seiten') {
      return res.status(200).json(await seiten(sql, kampagne));
    }

    if (aktion === 'export') {
      const csv = await exportieren(sql, kampagne, seitenUrl(req));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="manereal-auswertung.csv"');
      return res.status(200).send(csv);
    }

    if (aktion === 'import') {
      if (req.method !== 'POST') return res.status(405).json({ fehler: 'Nur POST.' });
      const body = await leseBody(req);
      return res.status(200).json(
        await importieren(sql, body.csv, text(body.kampagne, 80)),
      );
    }

    if (aktion === 'loeschen') {
      if (req.method !== 'POST') return res.status(405).json({ fehler: 'Nur POST.' });
      const body = await leseBody(req);
      const token = text(body.token, 20).toUpperCase();
      if (!token) return res.status(400).json({ fehler: 'Kein Kontakt angegeben.' });
      // Durch "on delete set null" in visits bleibt der Verlauf anonym erhalten.
      await sql.query('delete from contacts where token = $1', [token]);
      return res.status(200).json({ ok: true });
    }

    return res.status(404).json({ fehler: 'Unbekannte Abfrage.' });
  } catch (err) {
    console.error('Auswertung fehlgeschlagen:', err.message);
    return res.status(500).json({ fehler: 'Abfrage fehlgeschlagen.' });
  }
};

// Mit exportiert für scripts/links-erzeugen.js und die lokalen Proben. Der
// Kommandozeilenweg ruft dieselbe Funktion auf wie das Dashboard -- es gibt
// keine zweite Umsetzung derselben Regeln, die auseinanderlaufen könnte.
module.exports.importieren = importieren;
module.exports.csvLesen = csvLesen;
module.exports.csvSchreiben = csvSchreiben;
module.exports.spalteFuer = spalteFuer;
module.exports.instantlySpalte = instantlySpalte;

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

const crypto = require('crypto');
const { db } = require('./_db');
const { neuerToken } = require('./_token');

const COOKIE = 'auswertung';
const GUELTIG_MS = 7 * 24 * 60 * 60 * 1000;
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
// schreibt Semikolon, fast alles andere Komma.
function csvLesen(roh) {
  const t = String(roh || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!t) return [];
  const kopfzeile = t.split('\n')[0];
  const trenner = kopfzeile.split(';').length > kopfzeile.split(',').length ? ';' : ',';

  const zeilen = [];
  let feld = '';
  let zeile = [];
  let inAnfuehrung = false;

  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (inAnfuehrung) {
      if (c === '"') {
        if (t[i + 1] === '"') { feld += '"'; i += 1; } else inAnfuehrung = false;
      } else feld += c;
    } else if (c === '"') inAnfuehrung = true;
    else if (c === trenner) { zeile.push(feld); feld = ''; }
    else if (c === '\n') { zeile.push(feld); zeilen.push(zeile); zeile = []; feld = ''; }
    else feld += c;
  }
  zeile.push(feld);
  zeilen.push(zeile);

  const kopf = zeilen.shift().map((s) => s.trim().toLowerCase());
  return zeilen
    .filter((z) => z.some((f) => f.trim()))
    .map((z) => {
      const satz = {};
      kopf.forEach((k, i) => { satz[k] = (z[i] || '').trim(); });
      return satz;
    });
}

function csvFeld(wert) {
  const s = String(wert == null ? '' : wert);
  return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function csvSchreiben(kopf, zeilen) {
  return '﻿' + [kopf.join(';')]
    .concat(zeilen.map((z) => z.map(csvFeld).join(';')))
    .join('\r\n');
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
    select c.token, c.name, c.company, c.campaign, c.sent_at,
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
    order by (b.besuche is null), b.lesezeit desc nulls last, c.name
  `, [kampagne]);
}

async function person(sql, token) {
  const [kontakt] = await sql.query(
    'select token, name, company, email, campaign, sent_at, optout_at from contacts where token = $1',
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

// Legt die Kontakte an und gibt dieselbe Liste mit Link-Spalte zurück -- die
// wandert als CSV zurück ins GMass-Sheet.
async function importieren(sql, csv, basis) {
  const saetze = csvLesen(csv).slice(0, MAX_IMPORT);
  if (!saetze.length) return { fehler: 'Die Datei enthält keine Zeilen.' };

  const fehlt = ['name', 'campaign'].filter((s) => !(s in saetze[0]));
  if (fehlt.length) {
    return { fehler: 'Diese Spalten fehlen in der Kopfzeile: ' + fehlt.join(', ') };
  }

  const zeilen = [];
  const werte = [];
  const params = [];

  for (const satz of saetze) {
    const name = text(satz.name, 120);
    const campaign = text(satz.campaign, 80);
    if (!name || !campaign) continue;

    const token = neuerToken();
    const sent = datumOder(satz.sent_at);
    const n = params.length;
    werte.push(`($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, $${n + 5}, $${n + 6}::date)`);
    params.push(token, name, text(satz.company, 160), text(satz.email, 200), campaign, sent);
    zeilen.push([name, satz.company || '', satz.email || '', campaign, token, basis + '/?m=' + token]);
  }

  if (!werte.length) return { fehler: 'Keine verwertbare Zeile gefunden (name und campaign sind Pflicht).' };

  await sql.query(
    `insert into contacts (token, name, company, email, campaign, sent_at)
     values ${werte.join(', ')} on conflict (token) do nothing`,
    params,
  );

  return {
    angelegt: zeilen.length,
    uebersprungen: saetze.length - zeilen.length,
    csv: csvSchreiben(['name', 'company', 'email', 'campaign', 'token', 'link'], zeilen),
  };
}

async function exportieren(sql, kampagne, basis) {
  const liste = await personen(sql, kampagne);
  return csvSchreiben(
    ['name', 'company', 'campaign', 'token', 'link', 'besuche', 'mensch', 'lesezeit_sekunden', 'cta', 'formular'],
    liste.map((p) => [
      p.name, p.company, p.campaign, p.token, basis + '/?m=' + p.token,
      p.besuche, p.mensch ? 'ja' : 'nein', Math.round(p.lesezeit / 1000),
      p.cta ? 'ja' : 'nein', p.formular ? 'ja' : 'nein',
    ]),
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
      return res.status(200).json(await uebersicht(sql, kampagne, von, bis));
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
      return res.status(200).json(await importieren(sql, body.csv, seitenUrl(req)));
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

// Für die lokale Probe mit exportiert.
module.exports.csvLesen = csvLesen;
module.exports.csvSchreiben = csvSchreiben;

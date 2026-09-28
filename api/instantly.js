// Holt aus Instantly nach, was vor dem Klick geschah.
//
// Das eigene Tracking beginnt beim Aufruf des Links. Was davor liegt -- ob die
// Mail tatsächlich hinausging, ob sie ankam, ob jemand geantwortet oder sich
// abgemeldet hat -- weiß nur Instantly. Diese Datei fragt einmal täglich nach
// und schreibt das Ergebnis in mail_events und in vier Spalten auf contacts.
//
// Kein Webhook. Der setzt den Hyper-Growth-Tarif voraus, der Arbeitsbereich hat
// Growth (siehe docs/INSTANTLY-ANBINDUNG.md). Der Unterschied ist allein die
// Aktualität: bis zu 24 Stunden statt Sekunden. Der Trichter verliert nichts.
//
// Die Zuordnung läuft über die Custom Variable "Token", die jeder Lead
// mitträgt. Weil contacts.token Primärschlüssel ist, ist er über alle Wellen
// hinweg eindeutig -- deshalb braucht der Abruf keinen Kampagnenfilter und
// niemand muss pflegen, welche Instantly-Kampagne zu welcher Welle gehört.
//
// Benötigte Environment-Variablen:
//   INSTANTLY_API_KEY   API-v2-Schlüssel, Scope all:read oder leads:read
//   CRON_SECRET         Vercel sendet den Wert selbsttätig als Authorization-
//                       Header, wenn es den Cron aufruft. Der Name ist deshalb
//                       nicht frei wählbar.
//   AUSWERTUNG_SECRET   prüft das Cookie, wenn der Knopf im Dashboard drückt

const crypto = require('crypto');
const { db } = require('./_db');
// Dieselbe Cookie-Prüfung wie im Dashboard, nicht eine zweite Umsetzung
// derselben Regeln -- die könnte auseinanderlaufen.
const { angemeldet } = require('./auswertung');

const API = 'https://api.instantly.ai/api/v2';
const JE_SEITE = 100;
// Sicherheitsnetz: 50 Seiten sind 5000 Leads. Der österreichische Markt hat
// rund 2000 bis 3000 Hausverwaltungen -- wird diese Grenze erreicht, ist etwas
// anderes kaputt als die Kampagnengröße.
const SEITEN_MAX = 50;

/* --- Hilfsmittel -------------------------------------------------------- */

function gleich(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

function zeit(wert) {
  if (!wert) return null;
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* --- Instantly ---------------------------------------------------------- */

// Alle Leads des Arbeitsbereichs, Seite für Seite. Ohne Kampagnenfilter: Der
// Token entscheidet, was uns gehört, nicht die Kampagne.
async function leadsHolen(key) {
  const leads = [];
  let nach = null;
  let seiten = 0;

  do {
    const rumpf = { limit: JE_SEITE };
    if (nach) rumpf.starting_after = nach;

    const antwort = await fetch(API + '/leads/list', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify(rumpf),
    });

    if (!antwort.ok) {
      const text = await antwort.text().catch(() => '');
      throw new Error('Instantly antwortete ' + antwort.status + ': ' + text.slice(0, 200));
    }

    const daten = await antwort.json();
    leads.push(...(daten.items || []));
    nach = daten.next_starting_after || null;
    seiten++;
  } while (nach && seiten < SEITEN_MAX);

  return { leads, seiten, abgebrochen: Boolean(nach) };
}

/* --- Deutung ------------------------------------------------------------ */

// Instantlys Lead-Status. Negative Werte sind Endzustände.
//   1 aktiv   2 pausiert   3 fertig   -1 gebounct   -2 abgemeldet   -3 übersprungen
function deuten(lead, jetzt) {
  const status = Number(lead.status);
  const kontakt = zeit(lead.timestamp_last_contact);
  const beruehrt = zeit(lead.timestamp_last_touch) || kontakt;
  const antworten = Number(lead.email_reply_count) || 0;

  const gebounct = status === -1;
  const abgemeldet = status === -2;
  const geantwortet = antworten > 0;

  const ereignisse = [];

  // Versendet: ein wiederholbares Ereignis. Geht der nächste Schritt hinaus,
  // wandert timestamp_last_contact mit und es entsteht eine zweite Zeile --
  // deshalb trägt der Schlüssel hier den Zeitstempel.
  if (kontakt) ereignisse.push({ type: 'sent', ts: kontakt, schluessel: 'sent|' + kontakt });

  // Die übrigen drei sind Zustände, nicht Vorgänge: Wer gebounct ist, bouncet
  // nicht jeden Tag neu. Ihr Schlüssel trägt darum keinen Zeitstempel, sonst
  // legte jeder Abgleich eine weitere Zeile an.
  if (gebounct) ereignisse.push({ type: 'bounced', ts: kontakt || jetzt, schluessel: 'bounced' });
  if (abgemeldet) ereignisse.push({ type: 'unsubscribed', ts: jetzt, schluessel: 'unsubscribed' });
  if (geantwortet) ereignisse.push({ type: 'replied', ts: beruehrt || jetzt, schluessel: 'replied' });

  // Ein Wort für die Spalte "Mail" im Dashboard, das Gewichtigste zuerst.
  let wort = 'offen';
  if (gebounct) wort = 'gebounct';
  else if (abgemeldet) wort = 'abgemeldet';
  else if (geantwortet) wort = 'geantwortet';
  else if (kontakt) wort = 'versendet';

  return {
    sentAt: kontakt,
    // Instantly nennt keinen Bounce-Zeitpunkt. Der letzte Kontakt ist der
    // Versuch, der gebouncet ist -- näher kommt man nicht heran.
    bouncedAt: gebounct ? (kontakt || jetzt) : null,
    // Ebenso für die Antwort: ein timestamp_last_reply, wie die Dokumentation
    // ihn nennt, gibt es in der Antwort nicht. Am 28.09.2026 geprüft.
    repliedAt: geantwortet ? (beruehrt || jetzt) : null,
    abgemeldet,
    wort,
    ereignisse,
    status,
  };
}

/* --- Abgleich ----------------------------------------------------------- */

async function abgleichen(sql, key) {
  const jetzt = new Date().toISOString();
  const { leads, seiten, abgebrochen } = await leadsHolen(key);

  const mitToken = leads.filter((l) => l.payload && l.payload.Token);
  const tokens = mitToken.map((l) => String(l.payload.Token).trim().toUpperCase());

  // Welche dieser Tokens kennen wir? Alles andere gehört nicht zu uns oder ist
  // nach einer DSGVO-Löschung verschwunden.
  const bekannt = new Set(
    tokens.length
      ? (await sql`select token from contacts where token = any(${tokens})`).map((r) => r.token)
      : [],
  );

  let geaendert = 0;
  let neueEreignisse = 0;

  for (const lead of mitToken) {
    const token = String(lead.payload.Token).trim().toUpperCase();
    if (!bekannt.has(token)) continue;

    const d = deuten(lead, jetzt);

    for (const e of d.ereignisse) {
      const treffer = await sql`
        insert into mail_events (token, campaign, type, ts, step, meta, dedupe_key)
        select ${token}, c.campaign, ${e.type}, ${e.ts}::timestamptz, null,
               ${JSON.stringify({ status: d.status })}::jsonb, ${token + '|' + e.schluessel}
          from contacts c where c.token = ${token}
        on conflict (dedupe_key) do nothing
        returning id`;
      if (treffer.length) neueEreignisse++;
    }

    // optout_at nur beim ersten Erkennen setzen. Instantly gibt den Zustand
    // heraus, nicht den Zeitpunkt -- ein zweiter Abgleich darf ihn nicht
    // nachträglich verschieben.
    const zeilen = await sql`
      update contacts set
        mail_sent_at    = ${d.sentAt}::timestamptz,
        mail_bounced_at = ${d.bouncedAt}::timestamptz,
        mail_replied_at = ${d.repliedAt}::timestamptz,
        mail_status     = ${d.wort},
        optout_at       = case when ${d.abgemeldet} then coalesce(optout_at, now()::timestamptz)
                               else optout_at end
      where token = ${token}
        and (mail_status is distinct from ${d.wort}
             or mail_sent_at is distinct from ${d.sentAt}::timestamptz
             or mail_bounced_at is distinct from ${d.bouncedAt}::timestamptz
             or mail_replied_at is distinct from ${d.repliedAt}::timestamptz
             or (${d.abgemeldet} and optout_at is null))
      returning token`;
    if (zeilen.length) geaendert++;
  }

  const bericht = {
    leads: leads.length,
    mitToken: mitToken.length,
    zugeordnet: tokens.filter((t) => bekannt.has(t)).length,
    unbekannt: tokens.filter((t) => !bekannt.has(t)).length,
    geaendert,
    neueEreignisse,
    seiten,
    abgebrochen,
  };

  await sql`
    insert into sync_state (key, ts, meta)
    values ('instantly', now(), ${JSON.stringify(bericht)}::jsonb)
    on conflict (key) do update set ts = now(), meta = excluded.meta`;

  return bericht;
}

/* --- Verteiler ---------------------------------------------------------- */

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  const aktion = String(url.searchParams.get('a') || '').slice(0, 20);

  const key = (process.env.INSTANTLY_API_KEY || '').trim();
  const cronGeheim = (process.env.CRON_SECRET || '').trim();

  if (aktion !== 'abgleich') return res.status(404).json({ fehler: 'Unbekannte Abfrage.' });

  // Zwei Wege herein: der Cron mit dem Geheimnis, oder ein angemeldeter Mensch
  // über den Knopf im Dashboard.
  const kopf = String(req.headers.authorization || '');
  const vomCron = Boolean(cronGeheim) && gleich(kopf, 'Bearer ' + cronGeheim);
  if (!vomCron && !angemeldet(req)) {
    return res.status(401).json({ fehler: 'Nicht angemeldet.' });
  }

  if (!key) {
    console.error('Instantly: INSTANTLY_API_KEY fehlt.');
    return res.status(500).json({ fehler: 'Nicht eingerichtet.' });
  }

  try {
    const bericht = await abgleichen(db(), key);
    return res.status(200).json({ ok: true, ...bericht });
  } catch (err) {
    console.error('Instantly-Abgleich fehlgeschlagen:', err.message);
    return res.status(502).json({ fehler: 'Abgleich fehlgeschlagen.' });
  }
};

module.exports.deuten = deuten;

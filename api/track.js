// Nimmt die Messpunkte der Website entgegen und schreibt sie in die Datenbank.
// Gegenstück zum Mess-Snippet am Ende von index.html.
//
// Der Endpunkt gibt niemals Daten heraus: jede Antwort ist 204 ohne Inhalt,
// auch bei ungültiger Eingabe. Die IP-Adresse dient ausschließlich der
// Ratenbegrenzung und wird nicht gespeichert; aus dem User-Agent entsteht nur
// 'mobil' oder 'desktop'.
//
// Bewusst keine Bot-Erkennung über den User-Agent: Die Link-Scanner der
// Mail-Gateways (Defender Safe Links, Proofpoint, Mimecast, Barracuda) rufen
// jeden Link beim Zustellen auf — aus Rechenzentrums-IPs und mit gefälschten,
// völlig normal aussehenden User-Agents. Kein übliches Bot-Merkmal schlägt
// dabei an. Die Unterscheidung trifft stattdessen der Browser: Ein Besuch gilt
// erst dann als Mensch, wenn ein Interaktionssignal eintrifft ('human').
//
// Benötigte Environment-Variablen in Vercel:
//   DATABASE_URL             Neon-Verbindung (Pflicht)
//   TRACKING_PERSONENBEZUG   '0' verwirft jeden Mail-Code (optional)

const { db } = require('./_db');

const TYPES = new Set([
  'visit', 'human', 'route_enter', 'route_leave',
  'cta_click', 'form_submit', 'form_error',
  'faq_open', 'mail_click', 'scroll',
]);

const ROUTES = new Set(['start', 'nachfolge', 'ueber-uns', 'impressum', 'datenschutz']);
const SIGNALS = new Set(['pointer', 'scroll', 'key', 'click', 'touch', 'dwell']);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{10}$/i; // Crockford-Base32, ohne I L O U

const MAX_EVENTS = 60;
const MAX_BODY = 16 * 1024;
const MAX_META = 400;
const MAX_DWELL_MS = 2 * 60 * 60 * 1000; // zwei Stunden; darüber ist es kein Lesen mehr

// Ratenbegrenzung pro Function-Instanz. Ein Besuch schickt mehrere Pakete,
// deshalb großzügiger als beim Kontaktformular.
const recentRequests = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 60;

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recentRequests.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentRequests.set(ip, hits);
  if (recentRequests.size > 500) recentRequests.clear();
  return hits.length > RATE_MAX;
}

function text(value, max) {
  return String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function personenbezugAktiv() {
  return (process.env.TRACKING_PERSONENBEZUG || '').trim() !== '0';
}

function deviceOf(ua) {
  return /Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua || '') ? 'mobil' : 'desktop';
}

function sourceOf(raw, hasToken) {
  if (hasToken) return 'gmass';
  const value = text(raw, 100).toLowerCase();
  if (!value || !/^[a-z0-9.-]+$/.test(value)) return 'direkt';
  return value;
}

// Je Ereignistyp ist genau ein Satz Zusatzangaben erlaubt. Alles andere wird
// verworfen — der Endpunkt nimmt keine beliebigen Objekte entgegen.
function cleanMeta(type, raw) {
  if (!raw || typeof raw !== 'object') return null;
  let out = null;

  if (type === 'human') {
    const signal = text(raw.signal, 20);
    if (SIGNALS.has(signal)) out = { signal };
  } else if (type === 'cta_click') {
    const cta = text(raw.cta, 40);
    if (cta) out = { cta };
  } else if (type === 'faq_open') {
    const q = text(raw.q, 160);
    if (q) out = { q };
  } else if (type === 'scroll') {
    const pct = Number(raw.pct);
    if (pct === 50 || pct === 90) out = { pct };
  }

  if (!out) return null;
  const json = JSON.stringify(out);
  return json.length > MAX_META ? null : json;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body.slice(0, MAX_BODY) || '{}');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('Paket zu groß');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(204).end();

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return res.status(204).end();
  }

  const visit = text(body && body.v, 40);
  if (!UUID_RE.test(visit)) return res.status(204).end();

  const events = Array.isArray(body.e) ? body.e.slice(0, MAX_EVENTS) : [];
  if (!events.length) return res.status(204).end();

  let sql;
  try {
    sql = db();
  } catch (err) {
    console.error('Tracking:', err.message);
    return res.status(204).end();
  }

  try {
    // Mail-Code auflösen. Unbekannt, abgemeldet oder Personenbezug
    // abgeschaltet: Der Besuch bleibt anonym, gezählt wird er trotzdem.
    let token = null;
    let campaign = null;
    const code = text(body.m, 20).toUpperCase();
    if (personenbezugAktiv() && TOKEN_RE.test(code)) {
      const found = await sql.query(
        'select token, campaign from contacts where token = $1 and optout_at is null',
        [code],
      );
      if (found.length) {
        token = found[0].token;
        campaign = found[0].campaign;
      }
    }

    // Der Code wird in jedem Paket mitgeschickt, nicht nur im ersten. Geht das
    // erste unterwegs verloren, legt das zweite den Besuch trotzdem richtig an.
    await sql.query(
      `insert into visits (id, token, campaign, source, device, country)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do nothing`,
      [
        visit,
        token,
        campaign,
        sourceOf(body.s, Boolean(token)),
        deviceOf(req.headers['user-agent']),
        text(req.headers['x-vercel-ip-country'], 2).toUpperCase() || null,
      ],
    );

    const rows = [];
    const params = [visit];
    let humanSignal = null;

    for (const event of events) {
      const type = text(event && event.t, 20);
      if (!TYPES.has(type)) continue;

      const route = ROUTES.has(text(event.r, 20)) ? text(event.r, 20) : null;

      let dwell = null;
      if (type === 'route_leave') {
        const ms = Number(event.d);
        if (Number.isFinite(ms) && ms > 0) dwell = Math.min(Math.round(ms), MAX_DWELL_MS);
      }

      const meta = cleanMeta(type, event.x);
      if (type === 'human' && meta) humanSignal = JSON.parse(meta).signal;

      const n = params.length;
      rows.push(`($1, $${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}::jsonb)`);
      params.push(type, route, dwell, meta);
    }

    if (!rows.length) return res.status(204).end();

    await sql.query(
      `insert into events (visit_id, type, route, dwell_ms, meta) values ${rows.join(', ')}`,
      params,
    );

    // Das erste Signal gewinnt — coalesce hält es fest, falls zwei Pakete
    // dicht hintereinander eintreffen.
    if (humanSignal) {
      await sql.query(
        'update visits set human = true, signal = coalesce(signal, $2) where id = $1',
        [visit, humanSignal],
      );
    }
  } catch (err) {
    console.error('Tracking fehlgeschlagen:', err.message);
  }

  return res.status(204).end();
};

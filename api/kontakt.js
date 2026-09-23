// Nimmt das Kontaktformular entgegen und schickt die Anfrage per E-Mail
// weiter. Versand über Brevo (EU, Frankreich) via REST — keine Abhängigkeit,
// damit die Seite ohne Build-Schritt bleibt.
//
// Benötigte Environment-Variablen in Vercel:
//   BREVO_API_KEY   API-Schlüssel aus dem Brevo-Konto (Pflicht)
//   MAIL_TO         Empfänger der Anfragen (Pflicht)
//   MAIL_FROM       Verifizierte Absenderadresse bei Brevo (Pflicht)
//   MAIL_FROM_NAME  Anzeigename des Absenders (optional)

const FIELDS = {
  name: 'Name',
  company: 'Unternehmen',
  email: 'E-Mail',
  phone: 'Telefon',
  units: 'Verwaltete Liegenschaften',
  message: 'Nachricht',
};

const UNIT_OPTIONS = ['', 'unter 50', '50–150', '150–400', 'über 400'];

const MAX_LENGTH = { name: 120, company: 160, email: 200, phone: 60, message: 4000 };

// Sehr einfache Ratenbegrenzung pro Function-Instanz. Hält Skriptfluten auf,
// ersetzt kein Captcha — auf ein Captcha wird bewusst verzichtet, es wäre für
// die Zielgruppe eine größere Hürde als der Spam ein Problem ist.
const recentRequests = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recentRequests.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentRequests.set(ip, hits);
  if (recentRequests.size > 500) recentRequests.clear();
  return hits.length > RATE_MAX;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function clean(value, max) {
  // Zeilenumbrüche in Kopfzeilen-Feldern verhindern (Header-Injection).
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function viennaTimestamp() {
  return new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());
}

function buildPlainText(data, receivedAt) {
  const rows = [
    `${FIELDS.name}: ${data.name}`,
    `${FIELDS.company}: ${data.company || '—'}`,
    `${FIELDS.email}: ${data.email}`,
    `${FIELDS.phone}: ${data.phone || '—'}`,
    `${FIELDS.units}: ${data.units || 'keine Angabe'}`,
  ];
  return [
    'Neue Anfrage über das Kontaktformular auf manereal.at',
    '',
    rows.join('\n'),
    '',
    `${FIELDS.message}:`,
    data.message || '— keine Nachricht hinterlassen —',
    '',
    '—',
    `Eingegangen am ${receivedAt}`,
    'Eine Antwort auf dieses E-Mail geht direkt an den Absender der Anfrage.',
  ].join('\n');
}

function buildHtml(data, receivedAt) {
  const e = escapeHtml;
  const row = (label, value) => `
      <tr>
        <th style="text-align:left;vertical-align:top;padding:10px 20px 10px 0;font:600 13px/1.5 Arial,Helvetica,sans-serif;color:#5A6B7B;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">${e(label)}</th>
        <td style="padding:10px 0;font:400 16px/1.55 Arial,Helvetica,sans-serif;color:#0E2A47;">${value}</td>
      </tr>`;

  const mailLink = `<a href="mailto:${e(data.email)}" style="color:#0F6C7C;">${e(data.email)}</a>`;
  const phoneLink = data.phone
    ? `<a href="tel:${e(data.phone.replace(/[^+\d]/g, ''))}" style="color:#0F6C7C;">${e(data.phone)}</a>`
    : '—';

  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F2F6F7;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;border-collapse:separate;">
    <tr><td style="padding:32px 36px 8px;">
      <p style="margin:0 0 4px;font:700 12px/1.5 Arial,Helvetica,sans-serif;color:#0F6C7C;letter-spacing:.18em;text-transform:uppercase;">Kontaktformular manereal.at</p>
      <h1 style="margin:0 0 4px;font:700 24px/1.3 Arial,Helvetica,sans-serif;color:#0E2A47;">${e(data.name)}</h1>
      <p style="margin:0;font:400 16px/1.5 Arial,Helvetica,sans-serif;color:#5A6B7B;">${e(data.company || 'Kein Unternehmen angegeben')}</p>
    </td></tr>
    <tr><td style="padding:16px 36px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #E1E8EC;">
        ${row(FIELDS.email, mailLink)}
        ${row(FIELDS.phone, phoneLink)}
        ${row(FIELDS.units, e(data.units || 'keine Angabe'))}
      </table>
    </td></tr>
    <tr><td style="padding:8px 36px 0;">
      <p style="margin:0 0 6px;font:600 13px/1.5 Arial,Helvetica,sans-serif;color:#5A6B7B;text-transform:uppercase;letter-spacing:.06em;">Nachricht</p>
      <div style="padding:18px 20px;background:#F2F6F7;border-radius:12px;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#0E2A47;white-space:pre-wrap;">${
        data.message ? e(data.message) : '<span style="color:#5A6B7B;">— keine Nachricht hinterlassen —</span>'
      }</div>
    </td></tr>
    <tr><td style="padding:24px 36px 32px;">
      <p style="margin:0;font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#5A6B7B;border-top:1px solid #E1E8EC;padding-top:16px;">
        Eingegangen am ${e(receivedAt)}.<br>
        Eine Antwort auf dieses E-Mail geht direkt an ${e(data.name)}.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'invalid_body' });
  }

  // Honeypot: ein für Menschen unsichtbares Feld. Ist es gefüllt, war es ein
  // Bot. Wir antworten trotzdem mit Erfolg, damit er es nicht erneut versucht.
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const data = {
    name: clean(body.name, MAX_LENGTH.name),
    company: clean(body.company, MAX_LENGTH.company),
    email: clean(body.email, MAX_LENGTH.email),
    phone: clean(body.phone, MAX_LENGTH.phone),
    units: UNIT_OPTIONS.includes(clean(body.units, 40)) ? clean(body.units, 40) : '',
    message: String(body.message == null ? '' : body.message).trim().slice(0, MAX_LENGTH.message),
  };

  if (!data.name || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) {
    return res.status(422).json({ ok: false, error: 'invalid_input' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !to || !from) {
    console.error('Kontaktformular: BREVO_API_KEY, MAIL_TO oder MAIL_FROM fehlt.');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const receivedAt = viennaTimestamp();
  const subject = data.company
    ? `Erstgespräch: ${data.name}, ${data.company}`
    : `Erstgespräch: ${data.name}`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: from, name: process.env.MAIL_FROM_NAME || 'Manereal Website' },
        to: to.split(',').map((address) => ({ email: address.trim() })),
        replyTo: { email: data.email, name: data.name },
        subject,
        textContent: buildPlainText(data, receivedAt),
        htmlContent: buildHtml(data, receivedAt),
      }),
    });

    if (!response.ok) {
      console.error('Brevo antwortete mit', response.status, await response.text());
      return res.status(502).json({ ok: false, error: 'send_failed' });
    }
  } catch (err) {
    console.error('Versand fehlgeschlagen:', err);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }

  return res.status(200).json({ ok: true });
};

// Für die lokale Formatvorschau (scripts/mail-vorschau.js) mit exportiert.
module.exports.buildHtml = buildHtml;
module.exports.buildPlainText = buildPlainText;

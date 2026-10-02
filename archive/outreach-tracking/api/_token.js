// Erzeugt die Codes für die personalisierten Outreach-Links.
//
// Crockford-Base32 ohne I, L, O und U: keine Verwechslung von I mit 1 oder O
// mit 0, wenn jemand den Code vorliest oder abtippt, und kein unbeabsichtigtes
// Wort. Zehn Zeichen ergeben rund 10^15 Möglichkeiten — nicht erratbar.
//
// Der Code wird ausdrücklich NICHT aus der E-Mail-Adresse abgeleitet. Sonst
// ließe er sich zurückrechnen, und wer einen Link hat, hätte die Adresse.

const crypto = require('crypto');

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LAENGE = 10;

function neuerToken() {
  const bytes = crypto.randomBytes(LAENGE);
  let out = '';
  for (let i = 0; i < LAENGE; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

module.exports = { neuerToken, ALPHABET, LAENGE };

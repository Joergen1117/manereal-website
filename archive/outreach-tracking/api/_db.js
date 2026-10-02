// Gemeinsamer Datenbankzugriff für api/track.js und api/auswertung.js.
//
// Anders als api/kontakt.js hat diese Datei eine Abhängigkeit. Der Grund:
// Neons roher HTTP-Endpunkt ist ein Implementierungsdetail des offiziellen
// Treibers und nicht als öffentliche Schnittstelle dokumentiert -- darauf zu
// bauen wäre fragil. Die Auslieferung von index.html ändert sich dadurch
// nicht, Vercel installiert das Paket nur für die Functions.
//
// Benötigte Environment-Variable in Vercel:
//   DATABASE_URL   Verbindungszeichenfolge aus der Neon-Integration

const { neon } = require('@neondatabase/serverless');

let client = null;

// Über Aufrufe derselben Function-Instanz hinweg wiederverwendet. Der Treiber
// spricht über HTTP, es gibt also keine Verbindung, die offen bleiben müsste.
function db() {
  if (client) return client;
  // getrimmt, weil beim Einfügen in Vercel leicht ein Leerzeichen mitwandert
  const url = (process.env.DATABASE_URL || '').trim();
  if (!url) throw new Error('DATABASE_URL fehlt');
  client = neon(url);
  return client;
}

module.exports = { db };

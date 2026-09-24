// Erzeugt die personalisierten Outreach-Links aus einer Kontaktliste.
//
// Dasselbe wie „Verwaltung → Kontakte einspielen“ im Dashboard, nur für die
// Kommandozeile — nützlich für große Listen oder wenn etwas wiederholt werden
// muss. Wer nur eine Liste einspielen will, nimmt das Dashboard.
//
//   node scripts/links-erzeugen.js kontakte.csv
//   node scripts/links-erzeugen.js kontakte.csv --trocken     (nichts schreiben)
//
// Eingabe: CSV mit Kopfzeile, Trennzeichen Komma oder Semikolon.
//   Pflicht:    name, campaign
//   freiwillig: company, email, sent_at (JJJJ-MM-TT)
//
// Ausgabe: <name>-mit-links.csv neben der Eingabedatei, mit zusätzlicher
// Spalte "link". Diese Spalte wandert ins GMass-Sheet, in der Mail steht
// dann {link}.
//
// Erwartete Umgebungsvariablen:
//   DATABASE_URL   Neon-Verbindung
//   SEITEN_URL     z. B. https://manereal.at   (sonst wird danach gefragt)

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { neuerToken } = require('../api/_token');
const { csvLesen, csvSchreiben } = require('../api/auswertung');

function abbruch(text) {
  console.error('\n  ' + text + '\n');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const trocken = args.includes('--trocken');
  const datei = args.find((a) => !a.startsWith('--'));

  if (!datei) abbruch('Aufruf: node scripts/links-erzeugen.js <kontakte.csv> [--trocken]');
  if (!fs.existsSync(datei)) abbruch('Datei nicht gefunden: ' + datei);

  const basis = (process.env.SEITEN_URL || '').trim().replace(/\/+$/, '');
  if (!basis) abbruch('SEITEN_URL fehlt, zum Beispiel: SEITEN_URL=https://manereal.at');

  const url = (process.env.DATABASE_URL || '').trim();
  if (!url && !trocken) abbruch('DATABASE_URL fehlt. Mit --trocken geht es auch ohne Datenbank.');

  const saetze = csvLesen(fs.readFileSync(datei, 'utf8'));
  if (!saetze.length) abbruch('Die Datei enthält keine Zeilen.');

  const fehlt = ['name', 'campaign'].filter((s) => !(s in saetze[0]));
  if (fehlt.length) abbruch('Diese Spalten fehlen in der Kopfzeile: ' + fehlt.join(', '));

  const kontakte = [];
  let uebersprungen = 0;

  for (const satz of saetze) {
    const name = (satz.name || '').trim();
    const campaign = (satz.campaign || '').trim();
    if (!name || !campaign) { uebersprungen += 1; continue; }
    kontakte.push({
      token: neuerToken(),
      name,
      company: (satz.company || '').trim(),
      email: (satz.email || '').trim(),
      campaign,
      sent_at: /^\d{4}-\d{2}-\d{2}$/.test(satz.sent_at || '') ? satz.sent_at : null,
    });
  }

  if (!kontakte.length) abbruch('Keine verwertbare Zeile gefunden (name und campaign sind Pflicht).');

  if (!trocken) {
    const sql = neon(url);
    // In Blöcken, damit auch sehr lange Listen nicht an der Paketgröße scheitern.
    for (let i = 0; i < kontakte.length; i += 200) {
      const teil = kontakte.slice(i, i + 200);
      const werte = [];
      const params = [];
      teil.forEach((k) => {
        const n = params.length;
        werte.push(`($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, $${n + 5}, $${n + 6}::date)`);
        params.push(k.token, k.name, k.company, k.email, k.campaign, k.sent_at);
      });
      await sql.query(
        `insert into contacts (token, name, company, email, campaign, sent_at)
         values ${werte.join(', ')} on conflict (token) do nothing`,
        params,
      );
    }
  }

  const ziel = path.join(
    path.dirname(datei),
    path.basename(datei, path.extname(datei)) + '-mit-links.csv',
  );

  fs.writeFileSync(ziel, csvSchreiben(
    ['name', 'company', 'email', 'campaign', 'token', 'link'],
    kontakte.map((k) => [k.name, k.company, k.email, k.campaign, k.token, basis + '/?m=' + k.token]),
  ), 'utf8');

  const wellen = [...new Set(kontakte.map((k) => k.campaign))];
  console.log('');
  console.log('  ' + kontakte.length + ' Kontakte' + (trocken ? ' (trocken, nichts geschrieben)' : ' angelegt'));
  if (uebersprungen) console.log('  ' + uebersprungen + ' Zeilen übersprungen (name oder campaign fehlte)');
  console.log('  Kampagnen: ' + wellen.join(', '));
  console.log('  Geschrieben: ' + ziel);
  console.log('');
  console.log('  Die Spalte "link" ins GMass-Sheet einfügen und in der Mail {link} schreiben.');
  console.log('  Als sichtbaren Linktext manereal.at setzen, nicht „hier klicken“ — die Abweichung');
  console.log('  zwischen Anzeigetext und Ziel ist ein Phishing-Merkmal und kostet Zustellrate.');
  console.log('');
}

main().catch((err) => abbruch('Fehlgeschlagen: ' + err.message));

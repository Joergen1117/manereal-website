// Spielt eine Kontaktliste ein und schreibt die Datei für Instantly.
//
// Dasselbe wie „Verwaltung → Kontakte einspielen“ im Dashboard, nur für die
// Kommandozeile — nützlich für Listen jenseits weniger tausend Zeilen. Es ruft
// buchstäblich dieselbe Funktion auf; es gibt keine zweite Umsetzung derselben
// Regeln, die auseinanderlaufen könnte.
//
//   node scripts/links-erzeugen.js kontakte.csv welle-2-wien
//
// Eingabe: CSV mit Kopfzeile, Trennzeichen Komma oder Semikolon.
//   Pflicht:     email
//   erkannt:     firstname/vorname, lastname/nachname, company/firma, sent_at
//   alles Übrige wird unverändert durchgereicht
//
// Ausgabe: instantly-<kampagne>.csv neben der Eingabedatei. Komma-getrennt,
// ohne BOM, mit der Spalte "Token". Der Link wird in Instantly daraus gebaut:
//   <a href="https://www.manereal.at/?m={{Token}}">www.manereal.at</a>
//
// Erwartete Umgebungsvariable:
//   DATABASE_URL   Neon-Verbindung

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { importieren } = require('../api/auswertung');

function abbruch(text) {
  console.error('\n  ' + text + '\n');
  process.exit(1);
}

async function main() {
  const [datei, kampagne] = process.argv.slice(2).filter((a) => !a.startsWith('--'));

  if (!datei || !kampagne) {
    abbruch('Aufruf: node scripts/links-erzeugen.js <kontakte.csv> <kampagne>');
  }
  if (!fs.existsSync(datei)) abbruch('Datei nicht gefunden: ' + datei);

  const url = (process.env.DATABASE_URL || '').trim();
  if (!url) abbruch('DATABASE_URL fehlt.');

  const ergebnis = await importieren(neon(url), fs.readFileSync(datei, 'utf8'), kampagne);
  if (ergebnis.fehler) abbruch(ergebnis.fehler);

  const ziel = path.join(
    path.dirname(datei),
    'instantly-' + kampagne.replace(/[^a-z0-9-]+/gi, '-') + '.csv',
  );
  fs.writeFileSync(ziel, ergebnis.csv, 'utf8');

  console.log('');
  console.log('  ' + ergebnis.angelegt + ' neu angelegt'
    + (ergebnis.schonVorhanden ? ', ' + ergebnis.schonVorhanden + ' waren schon in dieser Kampagne' : '')
    + (ergebnis.ohneAdresse ? ', ' + ergebnis.ohneAdresse + ' ohne gültige E-Mail-Adresse übersprungen' : ''));
  console.log('  Die Datei enthält alle ' + ergebnis.gesamt + ' Kontakte der Kampagne "' + kampagne + '".');
  console.log('  Spalten: ' + ergebnis.spalten.join(', '));
  console.log('  Geschrieben: ' + ziel);
  console.log('');
  console.log('  In Instantly: "Token" als Custom Variable zuordnen, dann in der');
  console.log('  Code-Ansicht der Sequenz:');
  console.log('    <a href="https://www.manereal.at/?m={{Token}}">www.manereal.at</a>');
  console.log('');
}

main().catch((err) => abbruch('Fehlgeschlagen: ' + err.message));

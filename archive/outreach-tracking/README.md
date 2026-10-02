# Outreach-Auswertung — ausgemustert am 02.10.2026

Hier liegt die gesamte eigene Messung der Website samt Dashboard,
Datenbank- und Instantly-Anbindung. Sie war vom 25.09. bis 02.10.2026
live und ist seither **nicht mehr Teil der Website**.

**Warum ausgemustert:** Mit dem Outreach wird kein persönlicher Link und
damit kein Code mehr verschickt. Ohne Code gibt es nichts, was sich einer
Person zuordnen ließe — der Zweck des Dashboards ist entfallen. Der
allgemeine Traffic soll künftig über Google Analytics gemessen werden.

Der Ordner wird nicht ausgeliefert (`archive/` steht in
[.vercelignore](../../.vercelignore)). Nichts hiervon läuft.

## Was hier liegt

Die Unterordner entsprechen der früheren Lage im Wurzelverzeichnis, damit
die Verweise der Dateien untereinander weiter stimmen.

| | |
|---|---|
| `auswertung.html` | Das Dashboard, früher unter `/auswertung` |
| `api/track.js` | Nahm die Messpunkte der Website entgegen |
| `api/auswertung.js` | Anmeldung, Zahlen fürs Dashboard, Import der Kontakte |
| `api/instantly.js` | Täglicher Abgleich mit Instantly (Cron, 05:00 UTC) |
| `api/_db.js`, `api/_token.js` | Datenbankzugriff, Erzeugung der Codes |
| `db/schema.sql` | Tabellen `contacts`, `visits`, `events`, `mail_events`, `sync_state` |
| `scripts/links-erzeugen.js` | Kontakte importieren und Links erzeugen, von der Kommandozeile |
| `docs/` | `TRACKING.md`, `INSTANTLY-ANBINDUNG.md`, `UMSTELLUNG-INSTANTLY.md`, `testmail-instantly.md`, `test-kontakte.csv` |
| `package.json` | Die einzige Abhängigkeit: `@neondatabase/serverless` |
| `snippet-head.html` | Skript aus dem `<head>` von `index.html`: las den Code `?m=` und entfernte ihn aus der Adresszeile |
| `snippet-messung.html` | Mess-Skript vom Ende von `index.html` |
| `snippet-datenschutz-abschnitt-4.html` | Abschnitt 4 der Datenschutzerklärung im Wortlaut vom 24.09.2026, samt der vier entfallenen Absätze |

Verweise aus `docs/` auf `../index.html`, `../vercel.json` und
`../content/` zeigen seit dem Umzug ins Leere; gemeint sind die Dateien im
Wurzelverzeichnis.

## Was dazu außerhalb des Repos gehörte

| | |
|---|---|
| Vercel, Environment-Variablen | `DATABASE_URL` (samt der übrigen Variablen der Neon-Integration), `AUSWERTUNG_PASSWORT`, `AUSWERTUNG_SECRET`, `AUSWERTUNG_TIMEOUT_MIN`, `SEITEN_URL`, `TRACKING_PERSONENBEZUG`, `INSTANTLY_API_KEY`, `CRON_SECRET` |
| Vercel, Cron | `/api/instantly?a=abgleich`, täglich — stand in `vercel.json` |
| Neon | Postgres-Datenbank, Standort Frankfurt |
| Instantly | API-v2-Schlüssel (lesend) und die Custom Variable `Token` je Lead |

Das Kontaktformular hängt an nichts davon. Es braucht weiterhin
`BREVO_API_KEY`, `MAIL_TO`, `MAIL_FROM` und optional `MAIL_FROM_NAME`.

## Wieder in Betrieb nehmen

1. `api/`, `auswertung.html`, `db/`, `scripts/` zurück ins
   Wurzelverzeichnis, die Abhängigkeit aus `package.json` in die dortige
   `package.json`.
2. In `vercel.json` die drei Functions, die beiden `noindex`-Header für
   `/auswertung` und den Cron wieder eintragen (Stand siehe Git-Historie,
   Commit `0d417e5`).
3. Die beiden Skripte aus `snippet-head.html` und `snippet-messung.html`
   wieder in `index.html` einsetzen — das erste direkt hinter die
   `viewport`-Angabe, das zweite vor `</body>`.
4. Datenbank anlegen, `db/schema.sql` einspielen, Variablen in Vercel
   setzen.
5. Abschnitt 4 der Datenschutzerklärung wieder vervollständigen. Er war
   ein Entwurf und rechtlich nicht bestätigt.

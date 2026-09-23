# Handoff MANEREAL

## 2026-09-19 · Branch main · c8e2479

### Wo wir stehen
- Geklärt: „zweiter Designvorschlag" = `designs/01-fassade/` (von Julia bestätigt).
  Kein neuer `02-*`-Ordner. Regel 7 bleibt unangetastet.
- Ausgangsdatei analysiert, ohne ihren Quelltext zu lesen: `python -m http.server 8777`
  + Playwright. `index.html` ist eine SPA mit 7 Routen (start, nachfolge, versprechen,
  ueber-uns, kontakt, impressum, datenschutz). Startseite: Hero, Unsere Vision,
  Unser Anliegen, Unser Angebot, Wer dahinter steht, CTA, Footer. Höhe 5225 px.
- Abschnitt 1 (Kopfzeile + Hero) durchgesprochen. Julias Entscheidungen:
  1. Runde Ecken überall raus (`border-radius: 0`)
  2. Schwebender Bildeindruck bleibt erwünscht
  3. Abdunklung nur hinter dem Text, nicht über dem ganzen Bild
  4. Beide Schaltflächen bleiben vorerst
  5. Bild-Varianten sollen gezeigt werden
- Rohmaterial gesichtet (`uploads/`, 8 Dateien): `iStock-1436951314.jpg` und
  `-7ecef730.jpg` sind identisch. Fünf Dateien sind Stock-Klischees (Holzklötzchen
  „SUCCESS"/„TOGETHER EVERYONE ACHIEVES MORE"/„WE ARE BETTER TOGETHER", lachende
  Meeting-Runde, zwei Handschläge) — für die Zielgruppe unbrauchbar.
  Brauchbar: `iStock-1432923297.jpg` (Karlskirche von oben, 5464×3640).
- **Befund Video:** `iStock-2172622017.mp4` hat nur 1280×720 bei 26,76 s Länge.
  Für ein Hero über volle Breite zu klein — sichtbar weich ab 1440 px Viewport. Verifiziert.
- Fünf Hero-Varianten gebaut und gescreenshottet: `_tmp/hero-varianten.html`
  (A Bestand korrigiert · B gleicher Aufbau mit Karlskirche · C geteilt, Text nie
  auf dem Bild · D ohne Bild · E Bildband). Alle rechtwinklig, Wortlaut wörtlich
  aus `brief/inhalte.md`.
- Empfehlung ausgesprochen: **C**, weil die Lesbarkeit des Leitsatzes dort nicht
  vom Bildmotiv abhängt. Entscheidung steht noch aus.
- `.gitignore` um `_tmp/` und `.playwright-mcp/` ergänzt.
- `designs/01-fassade/CLAUDE.md` wurde während der Session extern ergänzt
  (Fünf-Fragen-Tabelle jetzt ausgefüllt statt «offen»).
- Noch **kein** `designs/01-fassade/DESIGN.md` und **keine** `index.html` im Entwurfsordner.
  Laut `designs/README.md` muss DESIGN.md vollständig sein, bevor die erste Zeile HTML entsteht.

### Offene Entscheidungen
- **Hero-Variante A–E.** Empfehlung C, Zweitwahl B. Julia hat noch nicht gewählt.
- **Widerspruch „schwebende Flächen".** `designs/01-fassade/CLAUDE.md` Vorgabe 3
  verbietet sie, Julia will den schwebenden Eindruck behalten. Vermutete Auflösung:
  gemeint sind Glas-/Transparenzeffekte, nicht das eingerückte Bild. Von Julia
  unbestätigt — die Formulierung dort ist nachzuschärfen, nicht zu brechen.
- **iStock-Lizenz.** Welche Lizenz gekauft wurde, ist unbekannt. Regel 5 verlangt
  Klärung vor Veröffentlichung.
- **Hausschrift.** Noch nicht entschieden. Inter/Poppins/Montserrat projektweit
  ausgeschlossen. In den Varianten steht bewusst neutrale Systemschrift, damit die
  Bildfrage nicht von der Schriftfrage überlagert wird.
- **Video weiterverwenden?** Bei 720p entweder kleiner einsetzen, ersetzen oder
  durch Standbild ablösen. Offen.

### Nächste Schritte
1. Hero-Variante festlegen (Screenshots: `_tmp/var-A.png` bis `_tmp/var-E.png`).
2. `designs/01-fassade/DESIGN.md` aus `designs/_template/DESIGN.md` anlegen und
   vollständig füllen — inkl. Schriftvorschlag mit Kontrastnachweis.
3. `brief/assets/` befüllen: Ableitung aus `uploads/iStock-1432923297.jpg`
   (max. 2560 px, unter 400 KB, WebP) — Vorschaudatei `_tmp/v-karlskirche.jpg`
   liegt bei 567 KB und reißt das Budget aus `brief/assets/README.md`.
4. `designs/01-fassade/index.html` anlegen, Kopfzeile + Hero bauen.
5. Weiter mit Abschnitt „Unsere Vision" nach demselben Muster.
6. Telefonnummer klären — Regel 3 verlangt sie als sichtbaren Text, im Bestand
   steht nur `kontakt@manereal.at`.

### Sackgassen
- Playwright blockiert das `file:`-Protokoll. Lösung: `python -m http.server 8777`
  im Projektwurzelverzeichnis.
- Weder `ffmpeg` noch `magick` installiert (`convert` und Python/PIL 12.2.0 sind da).
  Video-Frames daher über den Browser geholt: `<video>` laden, `currentTime` setzen,
  `onseeked` abwarten, Viewport-Screenshot, mit PIL auf 1280×720 beschneiden.
- Playwright-Screenshot mit `element`/`ref` liefert trotzdem den Viewport, und die
  Scroll-Position wird vor dem Auslösen zurückgesetzt — `window.scrollTo()` vorher
  bringt nichts. Lösung: alle Varianten außer einer per `display:none` ausblenden,
  dann auf Position 0 schießen.
- Playwright darf nur innerhalb des Repos schreiben, nicht in das
  Scratchpad-Verzeichnis („outside allowed roots"). Screenshots landen daher in `_tmp/`.

### Referenzen
- `designs/01-fassade/CLAUDE.md` — Vorgaben 1–8, Verbote, Selbstprüfung
- `brief/ci.md` — Navy `#0E2A47` (13,6:1), Petrol `#0F6C7C` (5,3:1), Grau `#5B6B7A` (4,7:1);
  nur Navy erreicht das 7:1-Ziel für Fließtext
- `brief/inhalte.md` Zeilen 60–66 — Hero-Wortlaut, verbindlich
- `brief/assets/README.md` — Größenbudgets für Ableitungen
- `_tmp/hero-varianten.html` — die fünf Varianten (nicht versioniert)
- Gelöscht nach Gebrauch: `_grab.html`, `01-hero.png` im Wurzelverzeichnis

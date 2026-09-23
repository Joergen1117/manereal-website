# Erstentwurf — gestalterischer Bestand

Aus dem CSS der gebündelten `index.html` extrahiert (2026-09-17).

**Nur Entwurf 1 darf diese Datei lesen** — er orientiert sich bewusst an
der Formensprache des Erstentwurfs. Für alle anderen Entwürfe ist sie
gesperrt (siehe [../CLAUDE.md](../CLAUDE.md), Regel 1 und 7), damit sie
sich nicht unbemerkt in dieselbe Richtung ziehen lassen.

---

## Farbtokens

| Token | Wert | Anmerkung |
|---|---|---|
| `--teal` | `#0F6C7C` | faktische Hauptfarbe, rund 40 Verwendungen |
| `--teal-dark` | `#0B5461` | Abdunklung |
| `--teal-bright` | `#6FBECB` | Aufhellung |
| `--navy` | `#0E2A47` | nur als Ladehintergrund, gestalterisch kaum präsent |
| `--ink-soft` | `#5B6B7A` | Sekundärtext |
| `--line` | `#E8E5E0` | Linien, warmes Grau |

Weitere im CSS gefundene Werte ohne Token: `#B08D57` (Messing, einmalig),
`#93A0AC`, `#7FC5D2`, sowie die Flächentöne `#F2F6F7`, `#E7EDEF`,
`#EFF3F5`, `#FAF9F7` und Weiß.

Auffällig: Die Palette ist petrolfarben mit warmen, fast beigen
Hellwerten (`#FAF9F7`, `#E8E5E0`) — kein kühles Grau. Der Messing-Ton
kommt nur ein einziges Mal vor, wirkt also unentschieden.

## Typografie

- Eine einzige Schrift: **Inter**, eingebettet als WOFF2 über
  `@font-face` mit vollem Unicode-Satz (kyrillisch, griechisch,
  vietnamesisch inklusive) — unnötige Last, da die Seite deutsch ist.
- Fallback-Kette: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Keine zweite Schrift, keine Serifen, kein typografischer Kontrast
  zwischen Überschrift und Fließtext außer Größe und Gewicht.

## Strukturelle Merkmale

- **Video-Hero** mit dunklem Overlay und zweizeiliger H1
- **Eyebrow-Labels** über jeder Sektionsüberschrift ("Unsere Vision",
  "Unser Anliegen", "Der Weg zu uns")
- **Karten-Raster** für fast alles: Vision, Angebot, Stärken, Werte,
  Kompetenzen, Team, Kriterien
- **`tinted`-Sektionen** als abgesetzte Flächen im Wechsel
- **Foto-Bänder** und **Bildcollagen** als Sektionstrenner
- **Zweispaltige Gegenüberstellung** "Die Herausforderung / Unsere Lösung"
  mit Pfeil dazwischen
- **Numerierte Prozessschritte** 1–5 mit Zeitangaben
- **Klappbare FAQ**
- **Hash-Routing** in Vanilla JavaScript, alle sieben Seiten in einem
  Dokument, Umschalten per `hidden`-Attribut
- **Kontakt-Modal** mit Formular, das per `mailto:` abgeschickt wird
- Kopfzeile wird beim Scrollen deckend (`scrolled`-Klasse), auf
  Rechtstextseiten dauerhaft deckend (`data-solid="1"`)

## Schwächen, an denen Entwurf 1 ansetzt

1. **Inter** — der Font, an dem KI-generierte Gestaltung erkennbar ist.
   Kein typografischer Charakter, kein Kontrast.
2. **Alles ist eine Karte.** Sechs Sektionen mit nahezu identischem
   Karten-Raster erzeugen Gleichförmigkeit: Nichts hat Vorrang, also
   wirkt nichts wichtig.
3. **Kein Portrait auf der Startseite.** "Wer dahinter steht" nennt zwei
   Namen, zeigt aber kein Gesicht — bei einer Seite, die über Menschen
   Vertrauen herstellen muss, ist das die größte verpasste Chance.
4. **Zu viele Flächentöne** (fünf helle Grau-Beige-Werte) ohne
   erkennbare Systematik.
5. **Unicode-Überfracht bei der Schrift** und ein 5,4 MB großes
   Dokument mit eingebetteten Base64-Assets.
6. **Der Messing-Akzent** taucht einmal auf und bleibt dadurch
   wirkungslos.

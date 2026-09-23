# DESIGN.md — Entwurf 01 «Fassade»

Die **einzige** Quelle für gestalterische Werte dieses Entwurfs. Alles,
was im CSS steht, muss hier begründet sein. Gilt nur für diesen Ordner
(siehe [CLAUDE.md](CLAUDE.md)).

Marke und Logofarben sind vorgegeben:
[../../content/ci.md](../../content/ci.md).

---

## Farbe

Das Logo gewichtet Navy als Primärfarbe. Dieser Entwurf folgt der Marke
und dreht damit die Gewichtung des Erstentwurfs um, der Petrol
vierzigmal und Navy einmal verwendete.

| Token | Wert | Rolle |
|---|---|---|
| `--navy` | `#0E2A47` | Fließtext, Überschriften, Kopfzeilenwortmarke, dunkle Flächen |
| `--petrol` | `#0F6C7C` | Akzent: Zitatlinie, Linkunterstreichung, Fokusring, Zahlen |
| `--grey` | `#5B6B7A` | Sekundärtext, Bildlegenden — nur ab 18 px |
| `--paper` | `#FFFFFF` | Grundfläche |
| `--paper-warm` | `#FAF9F7` | abgesetzte Sektionen, gibt das "edel wirkend" |
| `--line` | `#D8D5D0` | Haarlinien, Rahmen |
| `--placeholder` | `#E5E3DF` | Bildplatzhalter bis zur Lieferung der Portraits |

Petrol und Grau sind **keine Textfarben für Fließtext** — ihr Kontrast
reicht dafür nicht (siehe unten). Fließtext ist immer Navy.

**Kontrastnachweis** — Projektziel 7:1 für Fließtext (Regel 3):

| Paarung | Verhältnis | Erlaubt für |
|---|---|---|
| `--navy` auf `--paper` | 13,6:1 | alles, auch Fließtext |
| `--navy` auf `--paper-warm` | 13,0:1 | alles |
| `--petrol` auf `--paper` | 5,3:1 | Überschriften ab 24 px, Linien, Ränder |
| `--grey` auf `--paper` | 4,7:1 | Sekundärtext ab 18 px, nie Fließtext |
| `--paper` auf `--navy` | 13,6:1 | invertierte Flächen, Text über Abdunklung |

**Dunkelmodus:** bewusst nicht unterstützt. Die Marke ist auf helle
Flächen gebaut, das Logo liegt nur als Navy-Petrol- und als
Weiß-Fassung vor. Ein dritter Modus wäre eine Designentscheidung ohne
Markengrundlage.

## Typografie

| | Schrift | Bezug | Begründung |
|---|---|---|---|
| Überschriften, Zitate | IBM Plex Serif | lokal, `assets/fonts/` | sichtbare Kanten und flache Serifen — dieselbe Rechtwinkligkeit wie das Layout |
| Fließtext, Navigation, Formulare | IBM Plex Sans | lokal, `assets/fonts/` | niedriger Strichkontrast, offene Formen, auf Bildschirmlesbarkeit ausgelegt |

Lokal eingebunden als WOFF2, auf `latin` und `latin-ext` beschränkt.
Damit entfällt Abschnitt 3 der Datenschutzerklärung (Google Fonts) und
es gibt keine Drittanbieter-Verbindung.

Gewichte: Serif 400 und 600, Sans 400 und 500. Mehr nicht — jedes
weitere Gewicht kostet Ladezeit ohne gestalterischen Gewinn.

**Skala** — Basis 18 px

| Ebene | Größe | Zeilenhöhe | Gewicht | Laufweite |
|---|---|---|---|---|
| Leitsatz im Hero | `clamp(2.75rem, 6vw, 5rem)` | 1,05 | Serif 600 | −0,02em |
| H1 Unterseiten | `clamp(2.25rem, 4.5vw, 3.5rem)` | 1,12 | Serif 600 | −0,015em |
| H2 | `clamp(1.75rem, 3vw, 2.5rem)` | 1,2 | Serif 600 | −0,01em |
| H3 | `1.375rem` (22 px) | 1,3 | Sans 500 | 0 |
| Zitat / Lead | `clamp(1.25rem, 2vw, 1.75rem)` | 1,45 | Serif 400 | 0 |
| Fließtext | `1.125rem` (18 px) | 1,65 | Sans 400 | 0 |
| Eyebrow | `0.875rem` (14 px) | 1,2 | Sans 500 | +0,12em, Versalien |
| Meta / Legende | `1rem` (16 px) | 1,5 | Sans 400 | 0 |

Eyebrows stehen in **Navy**, nicht in Grau — bei 14 px reicht der
Graukontrast nicht. Die farbige Markierung übernimmt eine
Petrol-Haarlinie daneben.

Maximale Zeilenlänge Fließtext: **68 Zeichen** (`max-width: 68ch`).
Kleinste Schriftgröße der Seite: 14 px, ausschließlich für Eyebrows.

## Raster und Maße

- Inhaltsbreite: **1200 px**; Bilder und dunkle Flächen laufen über die
  volle Fensterbreite
- Textspalte innerhalb der Inhaltsbreite: max. 68ch
- Seitenrand: **20 px** mobil, **48 px** ab 768 px, **64 px** ab 1200 px
- Abstandsskala: `4 · 8 · 16 · 24 · 40 · 64 · 96 · 144 · 200 px`
- Abstand zwischen Sektionen: **80 px** mobil, **144 px** ab 1024 px —
  großzügig, weil "wenig Text auf viel Fläche" gefordert ist
- **Radien: 0 px, ausnahmslos.** `border-radius` kommt im CSS nicht vor.
- Trennung von Flächen über Haarlinien (1 px `--line`) und Farbwechsel,
  **nie** über Schatten

**Breakpoints:** 375 / 768 / 1024 / 1200 px

## Hero

Der Kern der Vorgabe. Aufbau von oben nach unten:

1. **Kopfzeile** — weiß, deckend, nicht über dem Bild liegend, sondern
   darüber. Das Bild beginnt unter der Kopfzeile.
2. **Medienfläche** — Höhe `min(88vh, 860px)`. Nicht volle
   Fensterhöhe, damit die Unterkante sichtbar bleibt und klar wird,
   dass die Seite weitergeht.
   - Video `archive/source-images/iStock-2172622017.mp4` (Wien von oben),
     `object-fit: cover`, stummgeschaltet, in Schleife
   - `poster` mit einem Standbild: die Fläche ist sofort gefüllt, das
     Video erscheint, sobald es geladen ist
   - Bei `prefers-reduced-motion: reduce` **nur** das Standbild
3. **Abdunklung auf einer Seite** — linearer Verlauf von links:
   `linear-gradient(90deg, rgba(14,42,71,.88) 0%, rgba(14,42,71,.70) 42%, rgba(14,42,71,.10) 100%)`
   Navy statt Schwarz, damit die Abdunklung zur Marke gehört und nicht
   wie ein Foto-Filter wirkt.
4. **Leitsatz** — linksbündig auf der abgedunkelten Seite, in Weiß,
   IBM Plex Serif. Aus dem bestehenden Inhalt entnommen, nicht
   formuliert (Regel 6):

   > **Ihr Lebenswerk.**
   > **Unsere Verantwortung.**

5. **Zitatblock darunter**, auf weißer Fläche, zentriert in der
   Textspalte, mit Petrol-Haarlinie links, ohne Anführungsornament:

   > Manereal übernimmt Hausverwaltungen in Österreich und führt sie
   > verantwortungsvoll weiter.

6. **Team-Abschnitt** direkt danach.

Die beiden Schaltflächen des Erstentwurfs ("Vertrauliches
Erstgespräch", "So läuft die Übergabe →") stehen unter dem Leitsatz auf
der Abdunklung.

## Team-Abschnitt auf der Startseite

- Gezeigt werden **nur Jörgen Oberkofler und Lorenz Ambrosius** — die
  beiden Einträge mit vollständigem Text. Die übrigen drei erscheinen
  auf "Über Manereal". Das ist eine Auswahl, keine Textänderung.
- **Portraits im Hochformat 3:4, halbfigurig, in Farbe.** Zwei Spalten
  ab 768 px, darunter gestapelt.
- Bis zur Lieferung der Fotos: Platzhalterfläche in `--placeholder` mit
  eingeblendetem Sollmaß. Maßvorgaben in
  [assets/PORTRAITS.md](assets/PORTRAITS.md).
- Unter jedem Portrait: Name als H3, Beschreibungstext,
  **Telefonnummer als lesbarer Text** und `tel:`-Verweis. Die Nummern
  stehen im Inhalt bislang nur auf der Kontaktseite — sie hier
  zusätzlich zu zeigen, ist eine Anordnungsentscheidung und beantwortet
  Frage 1 und 5 früher.

## Auswahl: was die Startseite zeigt und was nicht

Vorgabe von Julia: **ganze Textfelder und Blöcke wegstreichen**, damit
wenig Text auf viel Fläche steht. Erlaubt nach Regel 6, solange kein
Wortlaut angetastet wird.

Der Erstentwurf zeigte auf der Startseite sechs Sektionen mit
zusammen rund 25 Textblöcken. Diese Fassung zeigt sechs Sektionen mit
elf Blöcken.

**Die Startseite zeigt:**

| # | Sektion | Inhalt |
|---|---|---|
| 1 | Hero | Leitsatz, zwei Schaltflächen |
| 2 | Zitat | die Lead-Zeile, allein auf weißer Fläche |
| 3 | Unsere Vision | Satz im Zentrum, vier Werte umlaufend |
| 4 | Unser Anliegen | nur die drei Kriterientitel mit Registernummern |
| 5 | Das Team | Jörgen Oberkofler und Lorenz Ambrosius |
| 6 | Der Weg zu uns | Abschlussblock mit Schaltfläche |

**Von der Startseite gestrichen** — vollständig vorhanden auf
`ansatz.html`, nichts geht verloren:

- **„Unser Angebot" mit sechs Punkten.** Der textreichste Block der
  Seite. Sechs gleichwertige Absätze erzeugen genau die
  Gleichförmigkeit, die dieser Entwurf vermeiden soll.
- **Die neun Unterpunkte der drei Ankaufskriterien.** Auf der
  Startseite stehen nur die drei Titel — „Größe & Portfolio",
  „Eigentümer & Nachfolge", „Flexible Lösung" — groß, mit Nummer und
  Haarlinie. Wer wissen will, ob er gemeint ist, folgt dem Verweis.
- **Die Verweiszeile „Mehr über uns →"** entfällt, weil der
  Team-Abschnitt jetzt selbst auf der Startseite steht.

*Abwägung, die du kennen sollst:* Die neun Kriterien-Unterpunkte sind
die Stelle, an der ein Besucher erkennt, ob er überhaupt zur Zielgruppe
gehört. Sie von der Startseite zu nehmen, kauft Ruhe gegen
Selbstauskunft. Die drei Titel und der Verweis sollen das auffangen —
falls es sich als zu knapp erweist, ist das die erste Stelle zum
Nachjustieren.

## Sektionsarchitektur

Damit nicht wieder alles gleich aussieht, hat **jede Sektion eine
eigene Bauform.** Keine Form wiederholt sich auf derselben Seite.

**Zentrum-Form** (für „Unsere Vision") — Julias Vorgabe: der Satz in
der Mitte, die Werte umlaufend.

```
┌─────────────────────────────────────────────────┐
│  UNSERE VISION ─────────────────────────────    │
│                                                 │
│   ⌂  Langfristige          ⌂  Starkes Team      │
│      Perspektive                                │
│      Ihr Unternehmen …        Gemeinsames …     │
│                                                 │
│         ┌───────────────────────────┐           │
│         │  Aufbau einer             │           │
│         │  österreichischen         │           │
│         │  Hausverwaltungsgruppe    │           │
│         │  mit starkem Netzwerk     │           │
│         │                           │           │
│         │  Im Zusammenschluss …     │           │
│         └───────────────────────────┘           │
│                                                 │
│   ⌂  Digital & effizient   ⌂  Synergien         │
│      Gemeinsame …             Buchhaltung …     │
└─────────────────────────────────────────────────┘
```

Umsetzung als CSS-Grid mit drei Spalten und drei Zeilen: die Werte
liegen in den vier Ecken, der Satz nimmt die Mitte ein und überspannt
alle drei Spalten. Unter 1024 px kippt es in eine einspaltige
Anordnung — Satz zuerst, dann die vier Werte als Paare.

Der zentrale Satz sitzt auf `--paper-warm` mit 1 px Rahmen in
`--line`, damit das Zentrum als Fläche lesbar wird. Kein Schatten,
keine Rundung.

**Register-Form** (für „Unser Anliegen") — drei große Zeilen:

```
01 ──────────────────────────────────────────────
   Größe & Portfolio

02 ──────────────────────────────────────────────
   Eigentümer & Nachfolge

03 ──────────────────────────────────────────────
   Flexible Lösung

                          Alle Kriterien im Detail →
```

Nummer in Petrol, Sans 500, `2rem`. Titel in Serif 600, `clamp(1.75rem,
3vw, 2.5rem)`. Haarlinie läuft von der Nummer bis zum rechten Rand.

**Weitere Formen** für die Unterseiten: Zeilen-Form (Prozessschritte),
Gegenüberstellung (Herausforderung / Lösung), Bildfläche mit
Textspalte, Klappliste (FAQ).

## Symbole

Nach Julias Vorgabe **groß**, nicht als Kartendekoration.

- **Größe 56 px** (mobil 48 px), Strichstärke 1,5 px, Farbe `--petrol`
- **Selbst gezeichnet als inline SVG**, ausschließlich aus geraden
  Linien und rechten Winkeln — keine Icon-Bibliothek, keine runden
  Formen, keine Flächen
- Sie nehmen das **Giebelmotiv des Logos** auf: das „M" aus zwei
  Dachschrägen ist das Grundmotiv, aus dem alle vier Zeichen abgeleitet
  sind
- Nur vier Symbole auf der ganzen Startseite, ausschließlich für die
  Vision-Werte. Keine weiteren Piktogramme irgendwo.

| Wert | Zeichen |
|---|---|
| Langfristige Perspektive | ein Giebel, darunter eine lange Grundlinie |
| Starkes Team | drei Giebel nebeneinander, unterschiedlich hoch |
| Digital & effizient | ein Giebel über einem gleichmäßigen Raster |
| Synergien & Skalen | zwei Giebel, die sich überschneiden |

## Bildsprache

- **Rolle:** Bilder tragen die Fläche, nie die Beweisführung. Kein Bild
  wird als übernommenes Objekt ausgegeben.
- **Hero:** Wien von oben, als Video.
- **Weitere Sektionen:** die vorhandenen Menschen-Aufnahmen
  (`iStock-1436951314`, `iStock-2184295789`, `iStock-539457550`) — nach
  Julias Entscheidung, dass nicht nur Häuser vorkommen sollen.
- **Nicht verwendet:** die drei Holzklotz-Motive
  (`iStock-1350787267`, `iStock-2258307045`, `iStock-2291756067`).
  Begründung in [../../PRODUCT.md](../../PRODUCT.md) und im Gespräch.
- **Behandlung:** Vollbreite oder halbe Fensterbreite, harter Anschnitt,
  keine Rahmen, keine Rundungen, keine Überlappungen. Wo Text auf Bild
  liegt, immer über einer Navy-Abdunklung von mindestens 65 %.
- Alle Bilder mit `loading="lazy"` außer dem Hero, mit `width`/`height`
  zur Vermeidung von Umbrüchen beim Laden.

## Bewegung

Zurückhaltung ist Vorgabe (Regel 3).

- **Erlaubt:** Farb- und Rahmenwechsel bei Maus- und Tastaturfokus
  (150 ms, `ease-out`); Hintergrundwechsel der Kopfzeile (200 ms);
  das Öffnen des Dialogs und der FAQ-Elemente in nativer Geschwindigkeit
- **Ausgeschlossen:** Scroll-Hijacking, Parallax, beim Scrollen
  einblendender Text, bewegte Zahlen, alles was Lesen an Bewegung bindet
- `prefers-reduced-motion: reduce` → Video wird durch das Standbild
  ersetzt, alle Übergänge auf 0 ms

## Komponenten

| Komponente | Gestaltung |
|---|---|
| Kopfzeile | Weiß, 1 px Linie unten in `--line`, Logo links (Höhe 32 px mobil / 40 px ab 768 px), Menü rechts in Sans 500, Navy. Klebend am oberen Rand. |
| Navigation mobil | Vollflächige, eckige Auszugsfläche in Weiß unter der Kopfzeile. Kein Überlagerungseffekt, keine Animation außer Ein- und Ausblenden. Schaltfläche mit `aria-expanded`. |
| Aktiver Menüpunkt | 2 px Petrol-Linie darunter |
| Primäre Schaltfläche | Navy-Fläche, weißer Text, 1 px Navy-Rand, Polsterung 16/32 px, 0 Radius. Bei Fokus: Fläche Petrol. |
| Sekundäre Schaltfläche | Transparent, 1 px Rand in aktueller Textfarbe |
| Link im Text | Navy, 1 px Unterstreichung in Petrol mit 3 px Abstand; bei Fokus Unterstreichung 2 px |
| Fokus-Indikator | 3 px Petrol-Umriss, 2 px Abstand — auf jedem bedienbaren Element sichtbar |
| Zitat | IBM Plex Serif, 3 px Petrol-Linie links, 24 px Innenabstand links, keine Anführungszeichen als Ornament |
| Sektion mit Registernummer | Nummer (`01`, `02`, `03`) in Sans 500 Petrol über der Überschrift, daneben Haarlinie über die restliche Spaltenbreite |
| Aufzählung | Eigene Markierung: 8 px Petrol-Quadrat, kein Punkt, kein Häkchen-Symbol |
| FAQ | Nativ `<details>`/`<summary>`, Trennlinien zwischen den Einträgen, Plus- und Minuszeichen aus Linien gezeichnet. Funktioniert ohne JavaScript. |
| Prozess-Schritte | Fünf Zeilen, links Zeitangabe in Petrol, rechts Titel und Text, Haarlinie zwischen den Zeilen. Keine Karten, kein Zeitstrahl-Ornament. |
| Personen-Block | Portrait 3:4 darüber, Name, Text, Telefonnummer |
| Formularfeld | 1 px Rand `--line`, 0 Radius, Polsterung 14/16 px, Beschriftung darüber in Sans 500, bei Fokus Rand Petrol 2 px |
| Kontakt-Dialog | Nativ `<dialog>`, weiße Fläche, eckig, keine Abdunklung mit Weichzeichnung — nur eine Navy-Fläche mit 70 % Deckkraft |
| Fußzeile | Navy-Fläche, weiße Schrift, invertiertes Logo, drei Spalten ab 768 px |

## Technische Entscheidungen

- **Sieben echte HTML-Dateien** statt Hash-Routing:
  `index.html`, `ansatz.html`, `versprechen.html`, `ueber-uns.html`,
  `kontakt.html`, `impressum.html`, `datenschutz.html`.
  Der Erstentwurf legte alle sieben Seiten in ein Dokument und schaltete
  per JavaScript um — damit ist ohne JavaScript nur die Startseite
  lesbar, und Suchmaschinen sehen eine einzige Seite. Echte Dateien
  lösen beides.
- **CSS:** eine Datei `assets/style.css`, Custom Properties im
  `:root`, keine Präprozessoren, kein Build-Schritt.
- **JavaScript:** genau zwei Aufgaben — mobiles Menü und der
  Kontakt-Dialog. Zusammen unter 2 KB. FAQ und Klappelemente sind
  nativ.
- **Ohne JavaScript:** alle sieben Seiten vollständig lesbar, Navigation
  funktioniert, FAQ öffnet, Formular ist als normales Formular
  abschickbar. Nur der Dialog öffnet dann nicht als Overlay, sondern die
  Verweise führen direkt zur Kontaktseite.
- **Gewichtsbudget:** HTML + CSS + JS unter 60 KB je Seite, Schriften
  zusammen unter 120 KB.

## Offene technische Punkte

- **Video wiegt 17,7 MB.** Für einen Hero zu schwer, Ziel wären 3–4 MB
  bei 1920 px Breite. Auf diesem Rechner ist kein ffmpeg installiert.
  Bis zur Komprimierung greift die Standbild-Lösung.
- **Standbild für den Hero** muss aus dem Video gewonnen werden —
  ebenfalls ffmpeg. Bis dahin dient `iStock-1432923297.jpg` (Wien von
  oben) als Ersatz, da motivgleich.
- **Logo liegt nur als PNG vor.** Eine SVG-Fassung wäre in der
  Kopfzeile schärfer und deutlich leichter.

## Was hier bewusst fehlt

- **Abgerundete Ecken, Schatten, Glaseffekte** — Vorgabe von Julia, und
  sie tragen die Rechtwinkligkeit der Fassaden-Idee.
- **Karten-Raster** — der Erstentwurf legte sechs Sektionen in fast
  identische Karten. Dieser Entwurf arbeitet stattdessen mit Linien,
  Registernummern und Flächenwechsel, damit eine Rangfolge entsteht.
- **Kleine Symbole in Kartenreihen** — der Erstentwurf setzte ein
  Piktogramm über jeden Kartentitel, alle gleich groß, alle gleich
  wichtig. Dieser Entwurf verwendet Symbole **groß und wenige**
  (siehe Abschnitt Symbole), nie als Dekoration einer Kartenreihe.
- **Zahlenleisten und Auszeichnungsreihen** — es gibt keine Zahlen zur
  Gruppe (siehe `../../PRODUCT.md`). Eine leere Vertrauensgeste wäre
  schlimmer als keine.
- **Dunkelmodus** — siehe Abschnitt Farbe.

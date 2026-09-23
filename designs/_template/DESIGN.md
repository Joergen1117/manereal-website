# DESIGN.md — Entwurf NN «NAME»

> **Vorlage.** Jeden «Platzhalter» durch konkrete Werte ersetzen.
> Vage Angaben ("modernes Blau", "gut lesbare Schrift") sind hier
> unbrauchbar — es gehören Zahlen und Hex-Werte hinein.

Die **einzige** Quelle für gestalterische Werte dieses Entwurfs. Alles,
was im CSS steht, muss hier begründet sein. Gilt nur für diesen Ordner
(siehe [CLAUDE.md](CLAUDE.md)).

---

## Farbe

Kein Wert ohne Zweck. Jede Farbe braucht eine Rolle, sonst fliegt sie raus.

| Token | Wert | Rolle |
|---|---|---|
| `--ink` | «#......» | Fließtext |
| `--ink-muted` | «#......» | Sekundärtext, Metadaten |
| `--paper` | «#......» | Grundfläche |
| `--paper-alt` | «#......» | abgesetzte Flächen |
| `--accent` | «#......» | «wofür genau — sparsam** |
| `--line` | «#......» | Trennlinien, Rahmen |

**Kontrastnachweis** (Pflicht, Ziel 7:1 für Fließtext):

| Paarung | Verhältnis |
|---|---|
| `--ink` auf `--paper` | «..:1» |
| `--ink-muted` auf `--paper` | «..:1» |
| `--accent` auf `--paper` | «..:1» |

**Dunkelmodus:** «unterstützt mit eigenen Werten / bewusst nicht
unterstützt, weil ...»

## Typografie

| | Schrift | Bezug | Begründung |
|---|---|---|---|
| Überschriften | «...» | «lokal in assets/ / Google Fonts» | «...» |
| Fließtext | «...» | «...» | «...» |

Inter, Poppins und Montserrat sind projektweit ausgeschlossen
(Regel 3). Lokal eingebundene Schriften vermeiden die
Datenschutzerklärung zu Google Fonts.

**Skala** — Basis 18 px, Faktor «...»

| Ebene | Größe | Zeilenhöhe | Gewicht | Laufweite |
|---|---|---|---|---|
| H1 | «... rem» | «...» | «...» | «...» |
| H2 | «... rem» | «...» | «...» | «...» |
| H3 | «... rem» | «...» | «...» | «...» |
| Fließtext | «... rem» | «...» | «...» | «...» |
| Klein / Meta | «... rem» | «...» | «...» | «...» |

Maximale Zeilenlänge Fließtext: «60–75 Zeichen»
Kleinste Schriftgröße auf der ganzen Seite: «... px» (nie unter 14 px)

## Raster und Maße

- Inhaltsbreite: «... px»
- Seitenrand mobil: «... px», Desktop: «... px»
- Spalten: «...»
- Abstandsskala: «z. B. 4 / 8 / 16 / 24 / 40 / 64 / 96 / 144 px»
- Vertikaler Abstand zwischen Sektionen: «... px» mobil / «... px» Desktop
- Radien: «... px» — oder keine, falls die Haltung es verlangt

**Breakpoints:** «... / ... / ...»

## Bildsprache

- Rolle der Bilder: «tragend / begleitend / rein atmosphärisch»
- Behandlung: «Zuschnitt, Farbbehandlung, Verhältnis»
- Portraits: «Format, Größe, Platzierung, Behandlung» — tragende Säule
  des Vertrauens (Regel 4), entsprechend zu gewichten
- Umgang mit dem Hero-Video: «...»

## Bewegung

Zurückhaltung ist Vorgabe, nicht Geschmack (Regel 3).

- Erlaubt: «...»
- Dauer: «... ms», Kurve: «...»
- Ausgeschlossen: Scroll-Hijacking, Parallax-Ketten, Text der erst beim
  Scrollen erscheint, Bewegung als Voraussetzung für Lesbarkeit
- `prefers-reduced-motion: reduce`: «was dann passiert»

## Komponenten

| Komponente | Gestaltung |
|---|---|
| Kopfzeile | «...» |
| Navigation mobil | «...» |
| Primärer Button | «...» |
| Sekundärer Button | «...» |
| Link im Text | «...» |
| Fokus-Indikator | «sichtbar, mindestens 3:1 zur Umgebung» |
| Karte / Block | «...» |
| Aufzählung | «...» |
| FAQ-Element | «...» |
| Prozess-Schritte | «...» |
| Personen-Block | «...» |
| Formularfeld | «...» |
| Fußzeile | «...» |

## Technische Entscheidungen

- CSS: «eine Datei / mehrere», Methodik: «...»
- JavaScript: «wofür, wie viel — Ziel ist so wenig wie möglich»
- Ohne JavaScript: «was dann noch funktioniert»
- Gewichtsbudget: «... KB HTML+CSS+JS, Bilder separat»

## Was hier bewusst fehlt

«Gestaltungsmittel, auf die dieser Entwurf verzichtet, und warum. Ein
Verzicht, der begründet ist, ist eine Entscheidung — einer, der
vergessen wurde, ist ein Fehler.»

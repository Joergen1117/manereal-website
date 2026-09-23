# Entwurf 01 — «Fassade»

Diese Datei gilt **nur für diesen Ordner**. Sie wird geladen, sobald
hier gearbeitet wird, und beschreibt die Haltung dieses einen Entwurfs.

---

## Abschottung

Verbindlich, siehe [../../CLAUDE.md](../../CLAUDE.md), Regel 1:

- **Nicht lesen:** `../02-*`, `../03-*` — die anderen Entwurfsordner.
  Auch nicht "nur kurz zum Vergleich".
- **Lesen:** `../../PRODUCT.md`, `../../brief/inhalte.md`,
  `../../brief/ci.md`, `../../brief/assets/`, sowie diese Datei und
  `DESIGN.md`.
- **Zusätzlich erlaubt** (Ausnahme nach Regel 7):
  `../../_archiv/erstentwurf-design.md` — dieser Entwurf ist der
  Bestandsnahe und darf wissen, wovon er sich absetzt.
- Keine Begründung darf auf einen anderen Entwurf verweisen.

## Die Idee dieses Entwurfs

**Der Bestand spricht für sich.** Die Seite zeigt zuerst ein Haus, dann
einen Satz, dann die Menschen — in dieser Reihenfolge und mit sehr wenig
sonst. Vertrauen entsteht aus Ruhe, Klarheit und großzügiger Fläche,
nicht aus der Menge an Information pro Bildschirm.

Der Name kommt vom Motiv: Eine Fassade ist flächig, streng gegliedert,
rechtwinklig — und sie steht schon lange.

## Vorgaben von Julia (verbindlich)

Diese Punkte sind gesetzt und nicht zur Diskussion:

1. **Kopfzeile:** Wortmarke „Manereal" im Markenblau, auf weißem oder
   edel wirkendem Grund. Das Menü liegt in der Kopfzeile.
2. **Alles rechtwinklig.** Keine abgerundeten Ecken — nirgends, weder
   bei Flächen noch Bildern noch Schaltflächen. `border-radius: 0`
   durchgehend.
3. **Keine Glaseffekte.** Kein `backdrop-filter`, keine
   Transparenzverläufe als Dekoration, keine schwebenden Flächen.
4. **Unter der Kopfzeile ein großflächiges Bild oder Stockvideo** eines
   Wiener Hauses oder mehrerer Häuser.
5. **Abdunklung auf einer Seite des Bildes**, darauf ein Leitsatz — ein
   Satz, der aus dem bestehenden Inhalt entnommen wird, nicht neu
   geschrieben (Regel 6).
6. **Darunter zitatartig** die Beschreibung, was Manereal tut.
7. **Sehr clean, vertrauenswürdig, wenig Text auf viel Bild und
   Fläche.**
8. **Danach der Team-Abschnitt.** Dessen Gestaltung wird noch
   besprochen — bis dahin nicht festlegen.

## Woher die Haltung kommt

Architekturfotografie und das Prinzip der Fassade: rechtwinklige
Gliederung, klare Kanten, wiederkehrende Achsen, keine Ornamentik. Dazu
die Gewichtung des Logos, das Navy als Primärfarbe setzt.

## Was dieser Entwurf bewusst nicht ist

Er ist **keine Kartensammlung.** Der Erstentwurf legte sechs Sektionen
in nahezu identische Karten-Raster — wenn alles gleich aussieht, hat
nichts Vorrang, also wirkt nichts wichtig. Dieser Entwurf arbeitet
stattdessen mit wenigen, großen Flächen und einer echten Rangfolge.

Er ist auch **kein Immobilienportal.** Die Häuser sind Atmosphäre und
Thema, nie Beleg. Kein Bild wird als „unser Objekt" ausgegeben — die
Gruppe hat noch keine übernommenen Betriebe (siehe
`../../PRODUCT.md`).

## Wie dieser Entwurf die fünf Fragen beantwortet

Aus [../../CLAUDE.md](../../CLAUDE.md), Regel 4.

| Frage | Mittel in diesem Entwurf |
|---|---|
| Wer sind diese Leute? | Team-Abschnitt unmittelbar nach dem Leitsatz, noch auf der Startseite. Zwei Portraits im Hochformat, groß, mit Namen und **Telefonnummer direkt am Gesicht**. |
| Was passiert mit Team und Kunden? | Der Punkt „Kontinuität für Team & Kunden" erhält in „Unser Angebot" die erste Position und mehr typografisches Gewicht als die übrigen. |
| Ist das Geld da? | Im vorhandenen Text nicht beantwortbar (siehe `../../PRODUCT.md`). Gestalterische Antwort: konsequenter Verzicht auf leere Vertrauensgesten — keine Zahlenleiste, keine Logoreihe, keine Auszeichnungen. Eine leere Geste wäre schlimmer als keine. |
| Erfährt jemand davon? | „Absolute Diskretion" und der Satz „Jedes Gespräch bleibt vertraulich" stehen als eigene, ruhige Fläche — nicht als eine Karte unter sechs gleichen. |
| Verliere ich die Kontrolle? | Kriterium „03 Flexible Lösung" und die fünf Prozessschritte mit Zeitangaben als Zeilen mit Haarlinien. Der Ablauf ist ablesbar, ohne etwas anklicken zu müssen. |

## Verbote in diesem Entwurf

Zusätzlich zu den projektweiten Verboten (Regel 3):

- `border-radius` in jeder Form
- `backdrop-filter`, Glas- und Milchglasflächen
- Karten-Raster als Standardlösung für eine Sektion
- Schlagschatten als Trägerelement — Kanten und Flächen trennen, nicht
  Schatten
- Bilder als Belegersatz

## Selbstprüfung vor jeder Abgabe

- [ ] Kein «Platzhalter» mehr in dieser Datei und in `DESIGN.md`
- [ ] Jeder Text wörtlich aus `../../brief/inhalte.md`, nichts
      umformuliert, nichts ergänzt — der Leitsatz ist entnommen, nicht
      formuliert
- [ ] Kein Blick in `../02-*` oder `../03-*`
- [ ] Kein einziges `border-radius` im CSS
- [ ] Fließtext mindestens 18 px, Kontrast ≥ 7:1 geprüft
- [ ] Text über Bild: Lesbarkeit bei jedem Bildmotiv geprüft, nicht nur
      beim aktuellen
- [ ] Telefonnummern und E-Mail als lesbarer Text vorhanden
- [ ] Bedienbar ohne Hover, mit Tastatur, bei 200 % Zoom
- [ ] `prefers-reduced-motion` respektiert; Video hat eine
      Standbild-Alternative
- [ ] Getestet bei 375 px, 768 px, 1440 px Breite
- [ ] Kein Bild über 400 KB, kein Asset direkt aus `../../uploads/`
- [ ] Die Seite ist bei deaktiviertem JavaScript noch lesbar

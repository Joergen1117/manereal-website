# Änderungsprotokoll der Website

Die Website ist [index.html](../index.html) im Wurzelverzeichnis. Sie ist
das entpackte Artifact-Bundle des Erstentwurfs, der als
[archive/erstentwurf.html](../archive/erstentwurf.html) erhalten bleibt.
Jede Abweichung davon wird hier festgehalten, damit nachvollziehbar
bleibt, was Gestaltung ist und was Inhalt betrifft (CLAUDE.md, Regel 6).

**Zu den Schritten 0 bis 28:** Die Website lag damals im Ordner
`original/`, die Bilder in `Bilder_Personen/` und `Bilder_Stock/`. Seit
Schritt 29 liegt sie im Wurzelverzeichnis. Wo ältere Einträge die alten
Pfade nennen, sind die neuen gemeint.

---

## 30 — Kontaktformular verschickt wirklich (23.09.2026)

**Vorher war es eine Attrappe.** Der Submit-Knopf baute einen
`mailto:`-Link und öffnete das E-Mail-Programm des Besuchers — verschickt
wurde nichts, der Besucher hätte in seinem eigenen Outlook nochmals auf
„Senden" drücken müssen. Wer Webmail im Browser nutzt (GMX, A1, Gmail —
in dieser Altersgruppe die Regel), bei dem passierte gar nichts. Die
Bestätigung „Danke für Ihre Nachricht" erschien trotzdem. Schlimmster
Fall: Der Interessent hält sich für gemeldet, und niemand ruft zurück.

### Technik

| | |
|---|---|
| Entgegennahme | [`../api/kontakt.js`](../api/kontakt.js), Vercel-Function |
| Region | Frankfurt (`fra1`), festgelegt in [`../vercel.json`](../vercel.json) |
| Versand | Brevo REST-API, Rechenzentren in der EU |
| Abhängigkeiten | keine — kein `npm install`, kein Build-Schritt |

*(Beide Dateien stammen aus dieser Sitzung, nicht von Julia — Schritt 29
vermutet das irrtümlich.)*

**Das E-Mail:** Betreff `Erstgespräch: Name, Unternehmen`. Antwort-An
steht auf der Adresse des Interessenten, „Antworten" geht also direkt an
ihn. Versandt wird Nur-Text **und** HTML; Telefonnummer und E-Mail sind
im HTML anklickbar. Fußzeile nennt den Eingangszeitpunkt in Wiener Zeit.

**Spam ohne Captcha:** ein unsichtbares Feld (`website`) — füllt es ein
Bot aus, wird verworfen und trotzdem „ok" geantwortet. Dazu höchstens
fünf Anfragen pro Minute und IP. Ein Captcha wäre für 55- bis 75-Jährige
eine größere Hürde als der Spam ein Problem.

**Fehlerfall:** Kommt die Nachricht nicht durch, erscheint nicht mehr
„Danke", sondern ein roter Hinweis mit kontakt@manereal.at. Das Formular
behauptet keinen Erfolg mehr, den es nicht gab.

**Vor Betrieb einzurichten** (Environment-Variablen in Vercel):
`BREVO_API_KEY`, `MAIL_TO`, `MAIL_FROM` (bei Brevo verifizierte Adresse),
optional `MAIL_FROM_NAME`. Fehlen sie, antwortet die Function mit 500 und
das Formular zeigt den Fehlerhinweis.

**Geprüft:** acht Fälle gegen die Function — gültige Anfrage, gefüllter
Honeypot, fehlender Name, ungültige E-Mail, GET statt POST, Zeilenumbrüche
im Namen (Header-Injektion), Ratenbegrenzung, fehlende Konfiguration.
Alle verhalten sich wie vorgesehen. Ein echter Versand hat noch nicht
stattgefunden, dafür fehlt der API-Schlüssel.

### Text

- **Bestätigung geändert** (Julia, 23.09.2026). „Falls sich Ihr
  E-Mail-Programm nicht geöffnet hat, schreiben Sie uns direkt an
  kontakt@manereal.at." ist ersatzlos entfallen — es öffnet sich kein
  E-Mail-Programm mehr. Davor steht neu „Vielen Dank!". Der Absatz lautet
  jetzt: *Vielen Dank! Wir melden uns innerhalb von 24 Stunden persönlich
  bei Ihnen.* Die Überschrift „Danke für Ihre Nachricht" darüber bleibt
  unverändert; der Dank steht damit zweimal untereinander.
- **Fehlerhinweis, neuer Text:** „Ihre Nachricht konnte nicht übermittelt
  werden. Bitte schreiben Sie uns direkt an kontakt@manereal.at."
- **Datenschutz, Abschnitt 3** heißt jetzt „Kontaktaufnahme und
  Kontaktformular" und hat vier neue Absätze: erhobene Felder und
  Rechtsgrundlage, Brevo als Auftragsverarbeiter nach Art. 28 DSGVO,
  IP-Adresse zur Spam-Abwehr, Speicherdauer. Die Hinweisbox „vor Go-Live
  prüfen" ist damit entfallen, ebenso die nun unbenutzte CSS-Regel
  `.legal .todo`.

**Offen:** Zwei Angaben im Datenschutztext sind Annahmen und gehören
verifiziert — die Speicherdauer von 24 Monaten und Firmierung samt
Anschrift von Brevo. Beides steht im Auftragsverarbeitungsvertrag, der
noch abzuschließen ist. Eine anwaltliche Prüfung des Gesamttexts steht
weiterhin aus; siehe Punkt 18 in
[`../content/inhalte.md`](../content/inhalte.md).

---

## 30 — Ladeschirm und `.vercelignore` (23.09.2026)

### Ladeschirm

Die alte Fassung auf `manereal-website.vercel.app` zeigt beim Laden kurz
eine Navy-Fläche mit der Wortmarke. Das kommt dort vom Artifact-Bundle
(`#__bundler_thumbnail`), das erst entpackt werden muss. Julia möchte
diesen Moment behalten.

Nachgebaut als `.splash`, **reines CSS** — ohne JavaScript kann nichts
hängen bleiben, wenn ein Skript scheitert:

| ab | |
|---|---|
| 0 s | Wortmarke wird eingeblendet, groß auf Navy |
| 0,45 s | Wortmarke blendet aus |
| 0,5 s | **Vorhang öffnet sich**: die obere Hälfte fährt nach oben, die untere nach unten, dahinter liegt schon das Hero-Bild |
| 1,15 s | Ladeschirm ist weg |

Die Wortmarke ist 620 px breit am Desktop, 76 % der Breite am Handy. Bei
`prefers-reduced-motion: reduce` erscheint der Ladeschirm gar nicht,
`pointer-events: none` sorgt dafür, dass er nie einen Klick abfängt.

*Abwägung:* Die neue Seite wiegt 63 KB und ist sofort da — es gibt
eigentlich nichts zu überbrücken. Der Ladeschirm kostet jeden Besucher
1,15 Sekunden. Er ist ein Markenmoment, kein technischer Notbehelf.

### Neues Logo eingepasst

Julia hat am 23.09.2026 ein neues Logo abgelegt: die Bildmarke mit
„Manereal", ohne die Zeile „HAUSVERWALTUNG" darunter. Die Datei war
**6000 × 3375 px, aber nur 9 % davon Logo** — der Rest durchsichtiger
Rand. Im Kopf der Seite, wo auf 44 px Höhe skaliert wird, blieb davon
fast nichts sichtbar.

Behoben: durchsichtigen Rand beschnitten und auf Anzeigegröße gebracht.

| | vorher | jetzt |
|---|---|---|
| `logo.png` | 6000 × 3375, 357 KB | 1200 × 220, 50 KB |
| `logo-white.png` | 6000 × 3375, 387 KB | 1400 × 263, 58 KB |

Julias Originaldateien liegen unverändert als
`archive/source-images/logo-6000.png` und `logo-white-6000.png`.

*Abwägung:* Die neue Seite wiegt 63 KB und ist sofort da — es gibt
eigentlich nichts zu überbrücken. Der Ladeschirm kostet jeden Besucher
0,75 Sekunden. Er ist ein Markenmoment, kein technischer Notbehelf.

### `.vercelignore`

Ausgeliefert werden nur `index.html`, `assets/`, `api/` und
`vercel.json`. Ohne diese Liste wären über die Domain auch `PRODUCT.md`,
`content/inhalte.md`, `docs/AENDERUNGEN.md` und das ganze `archive/`
abrufbar gewesen — also die internen Unterlagen samt Rohmaterial.

---

## 29 — Struktur aufgeräumt (23.09.2026)

Vorher war nicht erkennbar, welche Datei die Website ist: Eine
`index.html` lag im Wurzelverzeichnis (der 5,4-MB-Erstentwurf), eine
zweite in `original/`. Dazu 42 MB doppelte Bilddateien und Ordnernamen in
drei Schreibweisen.

### Neue Struktur

| | |
|---|---|
| `index.html` | die Website, einzige HTML-Datei im Wurzelverzeichnis |
| `assets/images/people/` | vier Porträts |
| `assets/images/stock/` | Video, Standbild, drei Fotos |
| `assets/images/brand/` | Logo, Grundriss-Zeichnung |
| `assets/fonts/` | `inter-latin.woff2`, `inter-latin-ext.woff2` |
| `content/` | vorher `brief/` |
| `docs/` | vorher `Doku/`, dazu dieses Protokoll |
| `archive/` | vorher `_archiv/`, dazu `erstentwurf.html`, `source-images/` (vorher `uploads/`), `unused/` |

Ordnernamen sind jetzt durchgehend englisch und kleingeschrieben, wie es
die Sprachregel in `CLAUDE.md` vorsieht. Die Dokumente darin behalten
ihre deutschen Namen, weil jeder Querverweis im Projekt auf sie zeigt.

Dateinamen der Bilder sagen jetzt, was zu sehen ist, statt
iStock-Nummern: `hero-video.mp4`, `hero-still.jpg`, `handshake.jpg`,
`handshake-small.jpg`, `approach-header.jpg`, `meeting.jpg`. Die
Zuordnung zur Lizenz steht weiterhin in den Bildnachweisen im Impressum,
die Originaldateien tragen ihre iStock-Nummern im Archiv.

### Ableitungen statt Originale

Die Website lud bisher iStock-Originale mit bis zu 8530 × 5687 px.
Jetzt lädt sie Ableitungen in der Größe, die sie braucht:

| Bild | vorher | jetzt |
|---|---|---|
| Angebot, Foto rechts | 8530 × 5687, 16,1 MB | 2400 × 1600, 268 KB |
| Unser Ansatz, Kopfbild | 3864 × 2577, 4,5 MB | 2400 × 1601, 345 KB |
| Ablauf, Foto rechts | 3992 × 2494, 5,0 MB | 1800 × 1125, 175 KB |
| Porträt Lorenz | 3543 × 2363, 2,1 MB | 900 × 600, 51 KB |

**27,7 MB → 839 KB.** Damit erfüllt die Seite Regel 5: Ausgeliefert
werden nur Ableitungen, die Originale liegen in `archive/source-images/`.
Das Hero-Video bleibt bei 17 MB, dafür fehlt auf diesem Rechner das
Werkzeug zum Umkodieren.

### Kontrolle

- Kein Verweis auf einen alten Pfad mehr in `index.html`, keine
  fehlgeschlagene Anfrage, keine Konsolenmeldung.
- Desktop-Screenshot gegen den Stand davor: gleiche Seitenhöhe, und die
  Bildbereiche weichen im Mittel um 0,44 beziehungsweise 0,68 von 255 ab
  — unsichtbar. Der Rest ist identisch bis auf den Videobereich.
- Alle Querverweise in den Dokumenten auf die neuen Ordner gezogen.

**Nicht angefasst:** `api/kontakt.js` und `vercel.json`, beide am
23.09.2026 um 11:24 von Julia angelegt.

---

## 0 — Entpacken (21.09.2026)

Kein gestalterischer Eingriff. Das Bundle bestand aus einem JS-Loader,
einer Asset-Map (10 Base64-Dateien) und dem Seitentext als JSON-String.
Entpackt zu:

- `index.html` — 1.507 Zeilen statt zwei Zeilen à 4,7 MB / 690 KB
- `assets/img/` — 3 Bilder · `assets/fonts/` — 7 woff2 (Inter)
- `archive/source-images/` — 8 iStock-Originale, 78 MB, aus dem Wurzel-`archive/source-images/`
  kopiert. Sie waren nicht Teil des Bundles, werden aber direkt
  referenziert.

Inhalt und Gestaltung unverändert.

---

## 1 — Vision als Zitat (21.09.2026)

**Sektion:** `#vision` auf der Startseite.

| | |
|---|---|
| Überschrift | unverändert im Wortlaut, jetzt in deutsche Anführungszeichen gesetzt und als `<blockquote>` ausgezeichnet |
| Urheberzeile | neu: „— Die Gründer von Manereal" |
| Erklärsatz | **entfällt** an dieser Stelle |
| Vier Kacheln | unverändert |

**Zum entfallenen Satz:** „Im Zusammenschluss lösen wir die
Herausforderungen der Hausverwaltungsbranche und heben Potenziale, die
allein nicht erreichbar sind." — Der Satz bleibt auf der Seite
erhalten; er steht identisch in der Unterseite „Unser Ansatz". Er
verschwindet also nur aus der Startseiten-Vision, nicht aus dem
Bestand.

**Zur Urheberzeile:** „Die Gründer" statt des Firmennamens, weil ein
Unternehmen, das sich selbst zitiert, keine der fünf Fragen beantwortet
(Regel 4). Der Begriff stammt aus dem vorhandenen Wortlaut
(`content/inhalte.md`, FAQ 9 und Kontakt-Intro), ist also keine
Neuformulierung.

**Schreibweise:** *Manereal*, wie im Logo, im Seitentitel und
durchgängig in `content/inhalte.md`.

**Technisch:** neue CSS-Klasse `.vision-quote` am Ende des
Haupt-Stylesheets. Keine Bewegung, kein Hover, keine neuen Abhängigkeiten.

---

## 1a — Variantenvergleich: entschieden

Vier Fassungen standen zur Wahl. **Julia hat Variante D gewählt:** das
Zitat zwischen zwei Haarlinien, in Inter wie die übrige Seite. Die
anderen drei und die Beschriftungen sind entfernt.

Die Serifen-Fassung (Georgia) ist damit vom Tisch — die Seite bleibt
durchgehend bei Inter.

---

## 2 — Vision-Kacheln (offen, temporär)

Die vier Kacheln wirkten zu schematisch. Derzeit stehen **zwei
Fassungen untereinander**:

| | |
|---|---|
| 1 | Symbole von 22 auf 40 px, dünnere Strichstärke, Erklärtexte bleiben |
| 2 | Symbole auf 54 px, **Erklärtexte entfallen**, vier Schlagwörter nebeneinander |

**Achtung bei Fassung 2:** Die vier Erklärsätze kommen im gesamten
Dokument nur **einmal** vor — anders als beim Vision-Erklärsatz aus
Schritt 1 gibt es keine Zweitverwendung. Entscheidet sich Julia für
Fassung 2, verschwinden diese vier Sätze vollständig von der Website:

- „Ihr Unternehmen wird verantwortungsvoll weitergeführt und langfristig gestärkt.“
- „Gemeinsames Recruiting, eigene Akademie und Fachkräfte aus dem Verbund, wenn Ihr Team sie braucht.“
- „Gemeinsame Plattform und Prozesse statt teurer Einzellösungen.“
- „Buchhaltung, Recht, Finanzen, Marketing: Geteiltes Know-how für mehr Schlagkraft am Markt.“

Das ist nach Regel 6 zulässig (Weglassen ganzer Blöcke), aber eine
inhaltliche Entscheidung, keine gestalterische.

---

## 3 — Reihenfolge der Startseite (22.09.2026)

„Unser Anliegen" und „Unser Angebot" stehen jetzt direkt unter dem
Hero; die Vision rückt dahinter.

| vorher | nachher |
|---|---|
| Hero → Vision → Anliegen → Angebot → Wer dahinter steht → CTA | Hero → **Anliegen → Angebot** → Vision → Wer dahinter steht → CTA |

Kein Textblock entfällt, kein Wortlaut geändert — reine Umsortierung
(Regel 6 erlaubt das ausdrücklich).

**Nebeneffekt, offen:** „Wer dahinter steht" liegt dadurch noch weiter
unten. Nach Regel 4 ist „Wer sind diese Leute?" die erste Frage im Kopf
des Besuchers, und die Portraits sind die tragende Säule der Seite.
Ob dieser Block weiter nach oben gehört, ist noch zu entscheiden.

---

## 4 — Text und Hintergrund (22.09.2026)

### Entfallen — auf der ganzen Website

Beide Sätze kamen nur einmal vor, sie sind damit vollständig weg:

- Unter „Wir suchen Unternehmer…": *„Viele Hausverwaltungen in
  Österreich stehen vor der Nachfolgefrage. Wir bieten Ihrem
  Unternehmen, Ihrem Team und Ihren Kunden eine neue Heimat."*
- Unter „Unser Angebot": *„Jede Hausverwaltung ist anders. Deshalb gibt
  es bei uns kein Standardmodell, sondern ein Angebot, das zu Ihnen
  passt."*

### Geänderter Wortlaut

| vorher | nachher |
|---|---|
| Ein Angebot, das sich Ihrer Situation anpasst | Jede Hausverwaltung ist anders. So auch unser Angebot |

Dies ist die **erste Änderung am Wortlaut selbst**. Regel 6 schließt
das Umschreiben von Überschriften aus; Julia hat es am 22.09.2026
ausdrücklich angewiesen. Der erste Satzteil ist ein entnommener
Leitsatz aus dem gestrichenen Einleitungssatz derselben Sektion und
insofern eine Auswahl — „So auch unser Angebot" ist dagegen neu.
Vermerkt in `content/inhalte.md` unter „Hinweise zur Weitergabe", Punkt 6.

### Hintergrund entfernt

Die animierte Blueprint-Grafik (`.bp-base` / `.bp-glow`) ist weg:
zwei fixierte Ebenen mit einer Strichzeichnung, über die beim Laden
neun Sekunden lang ein Lichtstreifen wanderte. Sie lag hinter allen
Sektionen und kreuzte Überschriften und Fließtext.

Entfernt wurden die beiden `<div>`-Elemente, die zugehörigen Regeln
und die Keyframes (rund 3.900 Zeichen). `main, footer { z-index: 1 }`
bleibt stehen, schadet aber nicht. Kein anderer Seitenteil hat die
Grafik verwendet.

Nebeneffekt: Die Seite verliert damit ihre einzige Scroll-unabhängige
Animation — was Regel 3 ohnehin nahelegt.

---

## 5 — Neuer Hintergrund zur Auswahl (offen, temporär)

Die alte Zeichnung war kein Foto, sondern ein SVG: ein Wohnungsgrundriss
mit Wänden, Türbögen und Maßlinien, 680 px gekachelt. Sie ist als
[assets/img/blueprint.svg](assets/img/blueprint.svg) erhalten — mit
`stroke="#0E2A47"`, die Blässe wird über die Deckkraft der Ebene
gesteuert.

Vier Fassungen sind über `?bg=A|B|C|D` einschaltbar. Ohne Parameter
bleibt die Seite weiß.

| | |
|---|---|
| A | nur Papierton `#FBFAF7`, kein Muster |
| B | Grundriss ganzflächig, 820 px, 5,5 % Deckkraft, statisch |
| C | Punktraster 26 px, 9 % Deckkraft, auf `#FCFBF9` |
| D | Grundriss 700 px, 13 % Deckkraft, **nur in den Außenspalten** — eine Maske hält die mittleren 46 % frei |

B und D werden unter 900 px Breite ausgeblendet: Dort reicht die Fläche
neben dem Text nicht aus.

Keine Fassung bewegt sich. Nach der Entscheidung entfallen die
übrigen drei samt Umschalter-Script.

---

## 6 — Zeichnung in den getönten Bändern (offen, temporär)

Die grauen Bänder (`.tinted` um „Unser Anliegen", `#wer-dahinter`)
verdeckten die Zeichnung vollständig. Jetzt läuft sie durch:

**Standard (bei `?bg=B` und `?bg=D`):** Im grauen Band wechselt die
Zeichnung auf **Weiß**. Die Linien laufen über die Kante zwischen
weißer und grauer Fläche durch und kehren sich dort um — dasselbe
Motiv, als Negativ.

Technisch: ein Pseudo-Element auf dem Band mit
[assets/img/blueprint-white.svg](assets/img/blueprint-white.svg) und
`background-attachment: fixed`. Dadurch sitzt die Kachel deckungsgleich
mit der globalen Ebene, obwohl das Element im Fluss liegt und an der
Bandkante sauber abschneidet. Die Bandfarbe `#F2F6F7` bleibt unverändert
— kein Eingriff in den Inline-Style von `#wer-dahinter`.

**Alternative `&tint=durch`:** Statt der weißen Zeichnung wird das
graue Band selbst auf 66 % Deckkraft gesetzt, die dunkle Zeichnung
scheint gedämpft durch.

Unter 900 px Breite greift wie beim Hintergrund keine der beiden
Fassungen.

**Offen:** Julia hat die Hintergrund-Fassung (A–D) noch nicht
ausdrücklich benannt. Die Arbeit hier setzt **D** voraus.

---

## 7 — Nachbesserungen (22.09.2026)

### Aufhell-Effekt sichtbar gemacht

Die weiße Zeichnung war technisch korrekt, aber unsichtbar: Weiß auf
`#F2F6F7` sind rund 3 % Helligkeitsunterschied. Zwei Änderungen:

- Die Bandfarbe wird bei aktivem Hintergrund auf **`#E7EEF1`** gesetzt
  (vorher `#F2F6F7`). Ohne Hintergrund-Parameter bleibt der alte Ton.
- Die Strichstärke der weißen Fassung steigt von 1,1 auf 1,8.

**Zu prüfen:** Der Fließtext in den Bändern nutzt `--ink-soft`
(`#5B6B7A`). Auf `#F2F6F7` lag der Kontrast bei rund 4,7:1, auf
`#E7EEF1` bei rund 4,4:1. Beide Werte liegen unter dem in Regel 3
gesetzten Ziel von 7:1 — das ist ein Mangel der Vorlage, den dieser
Schritt geringfügig verstärkt. Sauber wäre, den Fließtext im Band
dunkler zu setzen.

### Vision neu gebaut

Aus dem Zitat wird ein zweispaltiger Block:

| | |
|---|---|
| links | Label „Unsere Vision", schmale Spalte (200 px) |
| rechts | der Satz, linksbündig, ohne Anführungszeichen |

**Entfallen:** die Anführungszeichen und die Zeile „Die Gründer von
Manereal". Damit ist die Sektion kein Zitat mehr — die Urheberzeile aus
Schritt 1a ist hinfällig. Der Wortlaut des Satzes bleibt unverändert.

Die beiden Haarlinien über und unter dem Block bleiben. Unter 820 px
Breite stehen Label und Satz untereinander.

---

## 8 — Vier Korrekturen (22.09.2026)

### Reihenfolge

**Hero → Vision → Anliegen → Angebot → Wer dahinter steht → CTA**

Die Vision steht direkt unter dem Hero. (Zwischenstand am selben Tag
war Anliegen → Vision → Angebot; verworfen.)

### Graues Band kürzer

`#anliegen` hatte 96 px Innenabstand nach unten (72 px unter 900 px
Breite). Jetzt 40 px bzw. 36 px. Das Band endet damit näher am letzten
Listenpunkt.

### Zahlen ersetzt

Die drei Kreise mit „01 / 02 / 03" sind ausgeblendet (`.crit-num`
bleibt im Markup, nur `display:none` — so bleibt die Reihenfolge im
Quelltext nachvollziehbar). Stattdessen trennen senkrechte Haarlinien
die drei Blöcke, in `rgba(14,42,71,.14)`.

Unter 900 px stehen die Blöcke untereinander; dort werden aus den
senkrechten Linien waagrechte.

### Zeichnung im Band gedämpft

Die helle Fassung nutzt statt reinem Weiß jetzt `#F6F9FA` — der
Kontrast zum Band `#E7EEF1` ist damit spürbar weicher.

---

## 9 — Kachel-Entscheidung und dunkle Bandfassung (22.09.2026)

### Kacheln: Fassung 2 gewählt

Aus Schritt 2 hat Julia **Fassung 2** gewählt. In der Vision stehen
jetzt die vier Schlagwörter nebeneinander (`.cw-keywords`), ohne
Erklärtext. Die Beschriftungen A/B/1/2 und der Vergleichsrahmen sind
entfernt.

**Fassung 1 ist nicht entfallen**, sondern ans Ende der Startseite
gewandert: eine eigene Sektion (`.cw-detail-section`) direkt vor dem
Abschluss-Block „Lassen Sie uns sprechen". Dort stehen dieselben vier
Symbole mit Überschrift und Erklärtext, 2×2.

Damit bleiben die vier Sätze über Recruiting, Akademie, Plattform und
geteiltes Know-how erhalten — der Verlust, der in Schritt 2 noch als
offene Frage vermerkt war, tritt nicht ein.

Die Sektion hat bewusst **keine eigene Überschrift**: Es gibt im
Bestand keine, und Regel 6 verbietet, eine zu erfinden.

### Dunkle Bandfassung zur Ansicht

Über `&tint=dunkel` wird die Zeichnung im grauen Band **dunkler** statt
heller: die normale Fassung `blueprint.svg` mit 30 % Deckkraft auf
`#E7EEF1` statt der hellen mit `#F6F9FA`.

Damit stehen drei Fassungen nebeneinander:

| | |
|---|---|
| Standard | Zeichnung wird im Band hell (`#F6F9FA`) |
| `&tint=dunkel` | Zeichnung wird im Band dunkler, deutlich kräftiger |
| `&tint=durch` | Band halbtransparent, Zeichnung scheint gedämpft durch |

---

## 10 — Zusammenführung (22.09.2026)

### Untere Sektion aufgelöst

Die in Schritt 9 angelegte Sektion vor dem Abschluss-Block ist wieder
entfernt. Ihre vier Erklärtexte sind **nicht verloren**, sondern in die
Viererreihe in der Vision gewandert: dort steht jetzt unter jedem
Schlagwort der zugehörige Satz.

Damit gibt es die vier Kacheln nur noch einmal auf der Seite.

**Zu prüfen:** In vier Spalten ist jede Textspalte rund 280 px breit —
das ergibt etwa 30 Zeichen je Zeile. Regel 3 nennt 60–75 Zeichen als
Ziel. Bei zwei Spalten wäre die Zeilenlänge richtig, bei vier ist sie
es nicht. Die Vierer-Anordnung ist eine ausdrückliche Entscheidung
Julias; der Konflikt ist hier vermerkt, nicht aufgelöst.

### Vision

- „Unsere Vision" steht wieder **über** dem Satz, nicht daneben; der
  Block ist zentriert wie die übrige Sektion.
- Schriftgrad des Satzes von `clamp(25px, 2.9vw, 38px)` auf
  `clamp(21px, 2.1vw, 29px)` reduziert.
- Die beiden Haarlinien bleiben.

### Helle Bandfassung zurückgesetzt

`blueprint-white.svg` steht wieder auf reinem Weiß (`#FFFFFF`) statt
`#F6F9FA` — in der abgemilderten Fassung war im Band nichts mehr zu
sehen. Die dunkle Fassung (`&tint=dunkel`) bleibt unverändert.

---

## 11 — Zusammenführung der Hintergrund-Logik (22.09.2026)

Es gibt keine `tint`-Varianten mehr. Eine Fassung gilt:

| Zone | Zeichnung |
|---|---|
| weißer Grund | Navy bei 13 % Deckkraft — wirkt grau-blau |
| graues Band | dieselbe Zeichnung bei 30 % — deutlich dunkler |

Die weiße Fassung `blueprint-white.svg` ist gelöscht, ebenso der
`tint`-Teil des Umschalter-Scripts. Der `?bg=`-Schalter bleibt, bis die
Hintergrund-Fassung endgültig feststeht.

### Weitere Änderungen

- **Angebot-Überschrift:** „Jede Hausverwaltung ist anders. So auch
  unser **individuelles** Angebot" (zweite Änderung am Wortlaut, auf
  Julias Anweisung — siehe `content/inhalte.md`, Punkt 6).
- **Unser Anliegen:** Die Aufzählungszeichen (Teal-Quadrate) sind
  entfernt, die Punkte stehen zentriert statt linksbündig.

### Panne und Korrektur

Beim Umbau des Band-CSS wurde versehentlich der Block aus Schritt 8
(Zahlen ausblenden, Trennstriche, kürzerer Abstand) mitgelöscht — die
Zahlen 01/02/03 waren kurzzeitig wieder sichtbar. Wiederhergestellt und
mit den neuen Listenregeln zusammengelegt.

### Schreibweise „Handschlagsqualität"

Auf Julias Anweisung an beiden Stellen der Website von
„Handschlagqualität" auf „Handschlagsqualität" geändert: in der
Überschrift von „Wer dahinter steht" und im Fließtext „Faire
Bewertung".

Die Form ohne Fugen-s ist die im Duden geführte; darauf wurde vor der
Umsetzung hingewiesen, die Entscheidung fiel danach. `content/inhalte.md`
behält den alten Wortlaut — Website und Brief weichen hier voneinander
ab, vermerkt dort unter „Hinweise zur Weitergabe", Punkt 7.

---

## 12 — Hintergrund fest eingebaut (22.09.2026)

Der `?bg=`-Schalter ist entfernt. Die Zeichnung ist jetzt fester
Bestandteil der Seite, ohne Parameter in der Adresse:

| Zone | Deckkraft |
|---|---|
| weißer Grund | 20 % (vorher 13 %) |
| graues Band `#E7EEF1` | 34 % (vorher 30 %) |

Beide Werte wurden angehoben, weil die Zeichnung auf Weiß zu blass war.
Die Maske hält weiterhin die mittleren 46 % frei; unter 900 px Breite
ist der Hintergrund aus.

Das Umschalter-Script vor `</body>` ist gelöscht.

### Aufzählung

Die Punkte in „Unser Anliegen" stehen wieder linksbündig mit
Aufzählungszeichen — statt der Teal-Quadrate jetzt ein 14 px langer
waagrechter Strich in derselben Farbe.

### Ursache des Fehlers

Die Zeichnung war auf weißem Grund nicht etwa zu blass, sondern gar
nicht da: Ohne `?bg=` in der Adresse war keine Fassung aktiv. Beim
Beheben fiel zusätzlich kaputtes CSS aus einem früheren Schritt auf —
zwei verwaiste Regelblöcke mit überzähligen Klammern, Rest eines
unsauber ersetzten Media-Query-Blocks. Sie haben den Parser aus dem
Tritt gebracht, sodass die nachfolgende `body::before`-Regel ignoriert
wurde. Entfernt; die Klammerbilanz aller drei Stylesheets ist jetzt
ausgeglichen (35/35, 283/283, 1/1).

---

## 13 — Feinschliff (22.09.2026)

- **Hintergrund auf Weiß** wieder heller: 13 % statt 20 %. Im grauen
  Band bleibt es bei 34 %.
- **Unser Anliegen:** Trennlinien zwischen den drei Blöcken entfernt,
  stattdessen wieder 56 px Abstand. Die Strich-Aufzählung bleibt.
- **Angebot-Überschrift** auf „Jede Hausverwaltung ist anders"
  gekürzt — ohne Punkt, ohne zweiten Satz. Damit ist sie wieder ein
  reiner Auszug aus dem Bestand (erster Satz des ursprünglichen
  Einleitungstexts, Schlusspunkt entfernt). Die Hinweise 6 in
  `content/inhalte.md` bleiben stehen, weil der ursprüngliche Titel
  „Ein Angebot, das sich Ihrer Situation anpasst" weiterhin ersetzt ist.

---

## 13 — Unterseiten neu gegliedert, Bilder in Ordner (22.09.2026)

### Zuletzt noch auf der Startseite
- Zeichnung auf weißem Grund heller: Deckkraft 20 % → 13 %.
- Trennlinien zwischen den drei Blöcken in „Unser Anliegen" entfernt.
- Angebot-Überschrift gekürzt auf **„Jede Hausverwaltung ist anders"**
  (Punkt und Nachsatz entfallen). Damit ist die Überschrift wieder eine
  reine Entnahme aus dem Bestand.

### Unser Ansatz (Route `nachfolge`)

| vorher | nachher |
|---|---|
| Bild → Herausforderungen → Ablauf → Stärken → FAQ | Bild → **Ablauf** → **Herausforderungen** → Stärken → FAQ |

- Herausforderungen: statt der Pfeil-Zeilen jetzt vier Karten (2×2).
  Oben das Problem, darunter abgetrennt „Unsere Lösung". Wortlaut und
  Paarung Problem/Lösung unverändert.
- FAQ: alle neun Fragen bleiben.
- Die grauen Bänder `#ablauf` und `#faq` zeigen jetzt ebenfalls die
  dunklere Zeichnung und denselben Grauton `#E7EEF1` wie die Startseite.

### Über uns (Route `ueber-uns`)

| vorher | nachher |
|---|---|
| Auf einen Blick → Kompetenzen → Team → Beirat | **Team** → Beirat → **Versprechen** → Kompetenzen |

- **„Manereal auf einen Blick" entfällt** auf der ganzen Website:
  Österreichischer Fokus / Eine Gruppe mit Bestand / Sitz in Wien.
  „Sitz und Portfolio in Österreich" steht weiterhin in „Unser Anliegen".
- Die vier Versprechen („Was Sie von uns erwarten können") sind von der
  Versprechen-Seite hierher gewandert.

### Navigation
„Unser Versprechen" ist aus Kopf- und Fußnavigation entfernt. Die Route
`#versprechen` existiert noch und enthält nur noch die **sechs Werte** —
offen, ob sie bleiben, wandern oder entfallen.

### Bilder
Alle Bilder liegen jetzt als eigene Dateien, nichts mehr als Base64 im
HTML (668 KB → 83 KB):

- `Bilder_Personen/` — joergen-oberkofler, lorenz-ambrosius,
  niklas-gruber, nikolaus-mueller, jakob-scherzenlehner
- `Bilder_Stock/` — die acht iStock-Dateien und `kontakt-hero.jpg`
  (vorher `img-10.jpg`, Quelle unbekannt)
- `assets/img/` — logo-light, logo-dark, blueprint.svg

Die unbenutzte Kopie `iStock-2258307045.jpg` ist aus der Arbeitskopie
entfernt (das Original liegt weiter im Wurzel-`archive/source-images/`).

**Offen vor dem Launch:** `Bilder_Stock/` umfasst 73 MB, darunter ein
17-MB-Video und ein 16-MB-JPEG; `lorenz-ambrosius.jpg` hat 3543 × 2363 px
bei 2 MB. Alles muss für die Auslieferung verkleinert werden.

---

## 14 — Versprechen-Seite aufgelöst, Hausverwalter zusammengefasst (22.09.2026)

**Texte bleiben im HTML** — keine Auslagerung in Einzeldateien (Julias
Entscheidung). Die Bildordner bleiben.

### Werte
Die sechs Werte („Worauf Sie sich bei uns verlassen können") stehen
jetzt **ganz unten auf „Über uns"**, vor dem Abschluss-Block.

Über uns damit: Team → Beirat → Versprechen → Kompetenzen → Werte → CTA.

### Versprechen-Route gelöscht
Die Seite hatte nach dem Umzug von Versprechen und Werten nur noch ihren
Kopf. **Auf der ganzen Website entfallen** damit:
- H1 „Worauf Sie sich bei uns verlassen können" (die gleichlautende H2
  der Werte bleibt)
- Lead „Eine Übergabe ist Vertrauenssache. Diese Versprechen geben wir
  jedem Unternehmer, der sein Lebenswerk in unsere Hände legt."
- die Bildcollage aus vier Stockfotos samt CSS

Alte Links auf `#versprechen` führen jetzt auf „Über uns"
(Weiterleitung im Router-Script).

Die vier Collage-Fotos sind aus `Bilder_Stock/` entfernt (73 → 44 MB);
die Originale liegen weiter im Wurzel-`archive/source-images/`.

### Team an Hausverwaltern
Die zwei Platzhalter „Hausverwalter/in" sind zu **einem** Block „Team an
Hausverwaltern" zusammengefasst: ein Gruppen-Symbol, Überschrift, Text,
abgesetzt unter den drei Portraits. Der Lorem-ipsum-Platzhalter entfällt.

**Übergangstext:** Bis Julias Text kommt, steht dort der bisherige Text
des ersten Platzhalters. Er ist in der Einzahl formuliert („Sein
Schwerpunkt") und passt nicht zu einem Team — er wird ersetzt.

Die Überschrift „Team an Hausverwaltern" ist neu und stammt von Julia.

### Panne
Beim Entfernen der Collage-Regeln blieb ein halber Selektor
(`.hc-tile +`) stehen, der die Regel des Angebot-Blocks auf der
Startseite erfasst hätte. Sofort entfernt; `.angebot-grid` geprüft,
Klammerbilanz ausgeglichen.

---

## 15 — Text „Team an Hausverwaltern" (22.09.2026)

Julias Text ersetzt den Übergangstext, wörtlich übernommen, drei Absätze.
Er steht jetzt auch in `content/inhalte.md` unter „Das Team" — die zwei
alten „Hausverwalter/in"-Zeilen sind dort durch ihn ersetzt.

**Offen:** Der neue Text deckt sich weitgehend mit dem Intro der
Kompetenzen weiter unten auf derselben Seite („Hinter Manereal stehen
erfahrene Partner mit mehr als 15 Jahren Praxis in der Hausverwaltung –
von der Betreuung von Eigentümern und Liegenschaften bis zu Teams …").
Beide beginnen gleich und nennen dieselbe Zahl und dieselbe Aufzählung.

---

## 16 — Team an Hausverwaltern: Breite und zweite Fassung (22.09.2026, offen)

- Fassung 1 (zentriert): Textfeld von 640 auf 880 px verbreitert.
- Fassung 2 (nebeneinander, `.hv-side`): Symbol und Überschrift
  linksbündig in einer 220-px-Spalte, der Text daneben. Unter 820 px
  untereinander.

Beide stehen beschriftet untereinander. Höhe auf Desktop: Fassung 1
449 px, Fassung 2 296 px. Nach der Wahl entfallen die andere Fassung,
die Beschriftungen und `.hv-compare`.

---

## 17 — Über uns: Feinschliff und Kompetenzen-Varianten (22.09.2026)

- **Team an Hausverwaltern:** Fassung 2 (nebeneinander) gewählt, Fassung 1
  und Beschriftungen entfernt. Symbol und Überschrift stehen zentriert
  übereinander, dieser Block sitzt senkrecht mittig neben dem Text.
- **Versprechen:** Symbole von 22 auf 44 px, Strichstärke 1,5.
- **Kompetenzen-Intro entfällt** auf der ganzen Website: „Hinter Manereal
  stehen erfahrene Partner mit mehr als 15 Jahren Praxis in der
  Hausverwaltung – … verantwortungsvolle Übergabe." Seine Aussage steckt
  im Text „Team an Hausverwaltern" (Dopplung aufgelöst, Hinweis 8 in
  `content/inhalte.md` erledigt).

### Kompetenzen: drei Varianten (offen, temporär)

| | |
|---|---|
| A — Verzeichnis | Zeilen mit Haarlinien, Titel links, Text rechts, keine Symbole |
| B — Grundriss | die fünf Kompetenzen als „Räume" eines Plans (2 oben, 3 unten), Wände als Linien, gestrichelte Türbögen, Titel als Raumbeschriftung |
| C — dunkles Band | Navy-Fläche, zwei Spalten, Symbole in Hellblau, weiße Titel |

Wortlaut in allen drei unverändert. Nach der Wahl entfallen die anderen
zwei und `.var-label` / `.kv-compare`.

### Nachtrag: Variante A gewählt, fünf Abwandlungen (offen, temporär)

Julia hat A (Verzeichnis) als Grundlage gewählt. B und C sind samt CSS
entfernt. Zur Wahl stehen jetzt:

| | |
|---|---|
| A1 | hell, wie bisher |
| A2 | Navy-Fläche, weiße Titel, helle Trennlinien |
| A3 | graue Fläche `#E7EEF1`, dunkle Schrift |
| A4 | leichte Titel (Schnitt 400, 25 px) in Teal, Text in Navy 18 px, mehr Luft |
| A5 | wie A1, mit kleinen Symbolen (28 px) vor den Titeln |

### Entscheidung: A5
Julia hat **A5** gewählt (Verzeichnis mit kleinen Symbolen). A1–A4 und
alle Beschriftungen sind entfernt, das CSS ist auf die eine Fassung
zusammengefasst. Unter 900 px steht der Text unter dem Titel.

---

## 18 — Werte entfallen (22.09.2026)

Die Sektion „Unsere Werte" ist von „Über uns" entfernt und kommt damit
**auf der ganzen Website nicht mehr vor**: Diskretion, Kontinuität,
Respekt, Verlässlichkeit, Offenheit, Auf Augenhöhe — samt H2 „Worauf Sie
sich bei uns verlassen können".

Inhaltlich bleibt das meiste abgedeckt (Diskretion: Angebot und FAQ;
Kontinuität und Respekt: Versprechen). **Ohne Entsprechung** sind
„Verlässlichkeit", „Offenheit" und der Satz „Wir kaufen nicht einfach
Unternehmen. Unternehmer sprechen mit Unternehmern."

Über uns: Team → Beirat → Versprechen → Kompetenzen → CTA.

---

## 19 — Neues Foto Niklas Gruber, zugeschnitten (22.09.2026)

Julia hat ein neues Foto hochgeladen (Ganzkörper, 1066 × 1600 px). Auf
ihren Wunsch zugeschnitten wie bei Jörgen und Lorenz: von knapp über
dem Kopf bis kurz unter die Gürtelschnalle → **1066 × 1145 px, 105 KB**.
Gilt für beide Stellen auf „Über uns" (Bildreihe und rundes Portrait).

Das ungeschnittene Original liegt unter
`archive/bilder/niklas-gruber-ganzkoerper.jpg` — außerhalb von
`original/`, damit es nicht mit ausgeliefert wird.

---

## 20 — Herausforderungen: Varianten ohne wiederholtes Label (22.09.2026, offen)

Julia behält die Kartenoptik, stört sich aber an „Unsere Lösung" in
jeder Karte. Unter der aktuellen Fassung stehen fünf Varianten, alle
ohne wiederholtes Label und mit unverändertem Wortlaut:

| | |
|---|---|
| 1 | Pfeil nach unten statt Trennlinie, Lösung fett |
| 2 | Lösung auf getönter Fläche (`#EAF3F4`) im unteren Kartenteil |
| 3 | kleiner Pfeil → vor dem Lösungssatz, keine Trennlinie |
| 4 | Lösung mit Teal-Balken links, fett |
| 5 | wie 2, dazu **einmal** über allen Karten eine Legende „Die Herausforderung / Unsere Lösung" (beide Begriffe aus dem Bestand) |

Nach der Wahl entfallen die übrigen, die Beschriftungen und `.chv-compare`.

---

## 21 — Entscheidungen und Fotovorschlag (22.09.2026)

- **Herausforderungen:** Variante 2 gewählt (Karte geteilt, Lösung auf
  getönter Fläche unten, kein Label). Übrige Varianten, Beschriftungen
  und „Unsere Lösung" entfernt; CSS auf `.ch-split` zusammengefasst.
- **Unser Ansatz:** Der Kontaktblock „Der Weg zu uns / Lassen Sie uns
  sprechen …" unter den FAQ entfällt auf dieser Seite. Die FAQ sind jetzt
  der letzte Abschnitt vor dem Fuß. Auf Start und Über uns bleibt der Block.
- **Über uns (Vorschlag zur Ansicht):** Die Bildreihe mit vier Portraits
  im Kopf entfällt. Team und Beirat zeigen stattdessen große
  Hochformat-Portraits (340 × 420 px, abgerundet) mit Name und Text
  darunter; Fließtext dort 16 px. Jedes Gesicht erscheint nur noch einmal.
  Sicherung des vorherigen Stands: `index.before-fotos.html` im
  Scratchpad der Sitzung.
- **Hinweis:** `joergen-oberkofler.jpg` hat nur 400 × 400 px und wird im
  großen Format leicht hochskaliert — auf hochauflösenden Bildschirmen
  unscharf. Ersatz nötig.

---

## 22 — Über-uns-Kopf, Angebot-Titel, Stärken (22.09.2026)

- **Portraits zurück auf die runden Kreise** (Vorschlag aus Schritt 21
  verworfen). Die Bildreihe im Kopf bleibt entfernt.
- **Kopf und Team:** Die Team-Überschrift „Das Team / Die Menschen
  dahinter" entfällt auf der ganzen Website. Der Seitenkopf (Wer wir
  sind / Über Manereal / Einleitung) ist auf dieser Seite zentriert und
  führt mit 72 px Abstand direkt zu den drei Portraits.
- **Angebot-Titel auf der Startseite** wieder im ursprünglichen Wortlaut:
  „Ein Angebot, das sich Ihrer Situation anpasst". Die Neuformulierungen
  aus den Schritten 4 und 13 sind damit hinfällig.
- **„Die Stärken der Gruppe" entfällt** (Unser Ansatz), samt H2 „Was Ihr
  Betrieb im Verbund gewinnt" und den fünf Kacheln. Drei davon stecken in
  den Lösungen der Herausforderungen; ganz weg sind „Sichtbarkeit" und
  „Finanzen & Reporting".

Unser Ansatz: Bild → Ablauf → Herausforderungen → FAQ.

---

## 23 — Impressum befüllt (22.09.2026)

Die Platzhalter und der Vor-Go-Live-Hinweis sind durch Julias Daten
ersetzt (Int. Möbelspedition R. Gruber Ges.m.b.H & CoKG, Linz). Telefon
und Fax auf ihren Wunsch weggelassen, nur E-Mail. Blattlinie und
Bildnachweise unverändert. Offene Punkte: `content/inhalte.md`, Hinweis 10.

---

## 24 — Widersprüche in Rechtstexten aufgelöst (22.09.2026)

Julias Entscheidungen: Konstruktion bleibt; Rechtsform GmbH;
„Winetzhammerstraße"; das Kontaktformular gilt als zweiter Kontaktweg;
E-Mail im Impressum: kontakt@manereal.at.

- **Impressum:** E-Mail auf kontakt@manereal.at, Gewerbe-Adresse auf
  „Winetzhammerstraße 3".
- **Bildnachweise:** Einleitungssatz korrigiert (iStock *und* Unsplash,
  Porträts von Team und Beirat); Tabelle auf die tatsächlich genutzten
  Bilder gebracht. Entfallen: Versprechen-Collage, Über-uns-Collage,
  „Über Manereal – Kopfbereich" (Unsplash, Daniel Koo). Neu benannt:
  „Startseite – Unser Angebot (Foto rechts)", „Unser Ansatz – Bild neben
  dem Ablauf", „Porträts".
- **Datenschutz:** Verantwortlicher mit den Impressumsdaten und
  kontakt@manereal.at befüllt. Abschnitt „3. Schriftarten" (Google Fonts)
  entfällt — die Schriften liegen lokal, der Text selbst sah das vor.
  Folgende Abschnitte neu nummeriert (3–5). Platzhalter „[Anpassen, falls
  später Tools eingesetzt werden.]" entfernt.
- **Kopf der Seite:** die zwei `preconnect`-Verweise auf
  fonts.googleapis.com / fonts.gstatic.com entfernt. Geprüft: Die Seite
  stellt jetzt keine einzige Verbindung zu fremden Servern her.
- **Fußzeile:** „Wien, Österreich" entfernt (widersprach dem Linzer
  Impressum). Es bleibt kontakt@manereal.at.

**Offen:** Die Hinweisbox „vor Go-Live prüfen" im Datenschutz steht
noch; sie fällt nach der rechtlichen Prüfung weg.

---

## 29 — Kontaktformular verschickt wirklich (23.09.2026)

**Vorher war es eine Attrappe.** Der Submit-Knopf baute einen
`mailto:`-Link und öffnete das E-Mail-Programm des Besuchers — verschickt
wurde nichts, der Besucher hätte in seinem eigenen Outlook nochmals auf
„Senden" drücken müssen. Wer Webmail im Browser nutzt (GMX, A1, Gmail —
in dieser Altersgruppe die Regel), bei dem passierte gar nichts. Die
Bestätigung „Danke für Ihre Nachricht" erschien trotzdem. Schlimmster
Fall: Der Interessent hält sich für gemeldet, und niemand ruft zurück.

### Jetzt

| | |
|---|---|
| Entgegennahme | [`api/kontakt.js`](../api/kontakt.js), Vercel-Function |
| Region | Frankfurt (`fra1`), festgelegt in [`vercel.json`](../vercel.json) |
| Versand | Brevo REST-API, Rechenzentren in der EU |
| Abhängigkeiten | keine — kein `npm install`, kein Build-Schritt |

**Das E-Mail:** Betreff `Erstgespräch: Name, Unternehmen`. Antwort-An
steht auf der Adresse des Interessenten, „Antworten" geht also direkt an
ihn. Versandt wird Nur-Text **und** HTML; Telefonnummer und E-Mail sind
im HTML anklickbar. Fußzeile nennt den Eingangszeitpunkt in Wiener Zeit.

**Spam ohne Captcha:** ein unsichtbares Feld (`website`) — füllt es ein
Bot aus, wird verworfen und trotzdem „ok" geantwortet. Dazu höchstens
fünf Anfragen pro Minute und IP. Ein Captcha wäre für 55- bis 75-Jährige
eine größere Hürde als der Spam ein Problem.

**Fehlerfall:** Kommt die Nachricht nicht durch, erscheint nicht mehr
„Danke", sondern ein roter Hinweis mit kontakt@manereal.at.

**Vor Betrieb einzurichten** (vier Environment-Variablen in Vercel):
`BREVO_API_KEY`, `MAIL_TO`, `MAIL_FROM` (bei Brevo verifizierte Adresse),
optional `MAIL_FROM_NAME`. Ohne sie antwortet die Function mit 500 und
das Formular zeigt den Fehlerhinweis — sie behauptet nie einen Erfolg,
den es nicht gab.

**Offen:** Der Bestätigungstext sagt weiterhin „Falls sich Ihr
E-Mail-Programm nicht geöffnet hat" — das trifft nicht mehr zu. Wortlaut
unverändert gelassen (Regel 6), Vermerk in
[`../content/inhalte.md`](../content/inhalte.md). Ebenso offen: der
Datenschutztext braucht einen Absatz zum Formular und zu Brevo, und es
braucht einen Auftragsverarbeitungsvertrag mit Brevo.

---

## 28 — Handy: Feinschliff (23.09.2026)

Wieder alles unter 900 px, mit einer Ausnahme: Der Logo-Klick gilt überall.

### Logo führt an den Seitenanfang

Ein Klick auf die Wortmarke springt jetzt immer nach oben — auch wenn die
Startseite schon offen ist. Vorher passierte nichts, weil der Verweis auf
`#start` bei bereits gesetzter Adresse kein Ereignis auslöst. Acht Zeilen
JavaScript am Ende des bestehenden Blocks. Am Aussehen ändert das nichts.

### Hero: Leitsatz oben, Schaltfläche unten

„Ihr Lebenswerk. Unsere Verantwortung." steht am Handy jetzt 32 px unter
der oberen Bildkante, die Schaltfläche 32 px über der unteren. Dafür deckt
die Abdunklung jetzt **beide** Kanten ab statt nur die untere:
`linear-gradient(to bottom, .82 → .40 → .32 → .80)` in Navy.

### Vier Vision-Punkte entfallen am Handy

„Langfristige Perspektive", „Starkes Team", „Digital & effizient",
„Synergien & Skalen" samt Erklärtexten sind am Handy weg. Übrig bleibt der
Satz zwischen den zwei Haarlinien. **Am Desktop stehen alle vier
unverändert.** Die eben erst gewählte Zeilenfassung aus Schritt 27 ist
damit hinfällig, ihr Markup und CSS sind entfernt.

### „Unser Anliegen" entfällt am Handy

Der ganze Abschnitt ist am Handy ausgeblendet — Eyebrow, die Überschrift
„Wir suchen Unternehmer, deren Lebenswerk wir weiterführen dürfen", die
drei Kriterien mit ihren neun Unterpunkten und das graue Band darum.
**Am Desktop bleibt alles unverändert.** Die Zeilenfassung aus Schritt 27
ist damit hinfällig, ihr Markup und CSS sind entfernt.

*Was das kostet:* Am Handy steht damit nirgends mehr, **wen** Manereal
sucht — über 50 Liegenschaften, Sitz in Österreich, offene Nachfolge.
Das ist die Antwort auf „Bin ich überhaupt gemeint?". Die Startseite am
Handy zeigt jetzt: Hero, Vision-Satz, Angebot, Personen, Abschluss.

*Julia dazu (23.09.2026):* Die Vorauswahl trifft der Outreach — wer auf
der Seite landet, wurde vorher angeschrieben und weiß, dass er gemeint
ist. Damit ist der Einwand erledigt.

### Standbild für das Video

Das Video hatte kein `poster`. Solange es nicht lief, stand im Hero eine
leere Navy-Fläche — genau das passierte auf Julias iPhone im
Stromsparmodus, der Autoplay grundsätzlich blockiert.

Jetzt hinterlegt: `Bilder_Stock/hero-standbild.jpg`, 1280 × 720 px,
158 KB. Es ist ein Einzelbild aus dem Video selbst, Sekunde 12, damit
Standbild und erstes Videobild denselben Blickwinkel zeigen. Gewonnen
ohne ffmpeg: Video im Browser laden, `currentTime` setzen, auf `seeked`
warten, Frame auf ein Canvas zeichnen, als JPEG herausschreiben.

Das Standbild gilt für beide Größen. Am Aussehen ändert sich nichts,
sobald das Video läuft.

### Angebot-Foto verkleinert (nur am Handy)

`iStock-539457550-mobil.jpg`, 1440 × 960 px, **120 KB** statt 8530 × 5687
und 16,1 MB. Angezeigt wird die Fläche mit 327 × 320 px, bei dreifacher
Pixeldichte braucht sie 981 × 960 — die kleine Fassung reicht also
genau. Am Desktop bleibt die Originaldatei, dort ist das Foto 430 × 942
px groß. Geprüft: Am Handy wird die 16-MB-Datei nicht mehr angefragt.

### Team an Hausverwaltern zentriert

Der Text stand am Handy linksbündig, während Symbol und Überschrift
darüber zentriert waren. Unter 820 px ist der ganze Block jetzt
zentriert, am Desktop bleibt er linksbündig neben dem Symbol.

### Angebot trägt am Handy die Anliegen-Überschrift

Weil „Unser Anliegen" am Handy entfällt, steht dort jetzt dessen
Überschrift **„Wir suchen Unternehmer, deren Lebenswerk wir weiterführen
dürfen"** über dem Angebot. Die bisherige Überschrift „Ein Angebot, das
sich Ihrer Situation anpasst" ist am Handy ausgeblendet, am Desktop
unverändert sichtbar. Wortlaut beider Sätze unangetastet; es ist eine
Auswahl, keine Formulierung (Regel 6).

Die Eyebrow darüber sagt weiterhin „Unser Angebot" — Beschriftung und
Überschrift sprechen am Handy also von zwei verschiedenen Dingen. Offen,
ob dort besser „Unser Anliegen" stehen sollte.

### Vision im grauen Band, Foto zurück

Mit dem Anliegen war auch das einzige graue Band im oberen Seitendrittel
verschwunden; zwischen Vision-Satz und „Unser Angebot" standen zwei weiße
Abschnitte mit zusammen 144 px Luft aneinander. Statt den Abstand nur zu
kürzen, liegt die **Vision am Handy jetzt selbst im grauen Band**
(`#E7EEF1`, 52 px Innenabstand). Die zwei Haarlinien um den Satz entfallen
dort, weil die Bandkanten dieselbe Aufgabe übernehmen. Der Wechsel hell /
getönt / hell / getönt / Navy ist damit wieder da.

Das **Foto neben dem Angebot** war kurz ausgeblendet und steht auf Julias
Wunsch wieder da (23.09.2026) — es wird am Handy sehr wohl angezeigt.
Damit lädt die Startseite dort weiterhin `iStock-539457550.jpg`:
**8530 × 5687 px, 16,1 MB** für eine Fläche von 327 × 320 px. Eine
verkleinerte Ableitung steht aus.

Startseite am Handy: **3.880 px**. Vor Schritt 27 waren es 7.816 px.

### Abschluss-Block

Sah gedrungen aus, vor allem die dreizeilige Schaltfläche. Am Handy jetzt:
Außenrand 16 px statt 40 px, Innenabstand 48/20 px statt 80/40 px,
Überschrift 25 px statt 28 px, Schaltfläche über die volle Breite.
Nutzbare Breite im Block: 247 px → 303 px.

### Kopf der Unterseiten

Über der Eyebrow lagen 164 px, davon 84 px unter der Kopfzeile versteckt —
sichtbar blieben 80 px Leere. Jetzt 116 px, also 32 px sichtbarer Abstand,
so viel wie auf der Startseite über dem Bild. Gilt für „Unser Ansatz" und
„Über Manereal".

**Stolperstein:** Die Regel stand zuerst im allgemeinen Handy-Block, der im
Stylesheet **vor** `.page-hero-inner` liegt — gleiche Spezifität, also
gewann die spätere Regel und nichts änderte sich. Jetzt steht sie am Ende.

### Kontrolle

- Desktop-Screenshot bei 1280 px Pixel für Pixel gegen den Stand vor diesem
  Schritt: Unterschiede nur zwischen y = 52 und 344, also im laufenden
  Video. Alles darunter identisch.
- Abschnittshöhen am Desktop unverändert: Vision 170, Anliegen 220,
  Angebot 648, Personen 203; Seite 4.685 px. Unterseiten-Eyebrow weiterhin
  bei 164 px.
- Logo-Klick geprüft: von der Startseite bei Position 2.500 → 0; von
  „Über Manereal" bei Position 1.500 → Startseite, Position 0.
- Startseite am Handy jetzt 4.846 px (vor Schritt 27: 7.816 px).

### Vorschau-Server

`python -m http.server` schickte Zwischenspeicher-Kopfzeilen, das Handy
zeigte nach Änderungen die alte Fassung. Ersetzt durch ein kleines Skript
mit `Cache-Control: no-store` und ohne `Last-Modified`. Liegt im
Sitzungs-Scratchpad, gehört nicht zur Website.

---

## 27 — Startseite am Handy (22.09.2026, teils offen)

Alles in diesem Schritt gilt **nur unter 900 px**. Der Desktop ist
unverändert; geprüft mit Screenshots bei 375 px und 1280 px.

### Hero

Über dem Video stehen am Handy nur noch der Leitsatz und **eine**
Schaltfläche. Ausgeblendet sind dort:

- der Lead-Satz „Manereal übernimmt Hausverwaltungen in Österreich und
  führt sie verantwortungsvoll weiter."
- die zweite Schaltfläche „So läuft die Übergabe →"

Beides bleibt am Desktop. Der Verweis auf die Übergabe steht am Handy
weiterhin unter „Unser Angebot", geht also nicht verloren. Der Lead-Satz
kommt wortgleich als Beschreibung der Seite und in der Fußzeile vor.

### Vision: Zeilenform gewählt

Von vier Fassungen hat Julia **Fassung 1 (Zeilen)** genommen: Symbol links,
Titel und Text rechts, Haarlinie zwischen den Punkten. Statt 735 px braucht
der Block am Handy jetzt 471 px. Die anderen drei Fassungen und die
Beschriftungen sind entfernt, das CSS ist auf `.m-rows` zusammengefasst.

### Anliegen, Angebot, Personen: entschieden

Julia hat aus jeweils zwei bis drei Fassungen gewählt. Höhen bei 375 px:

| Abschnitt | Bestand | gewählt | jetzt |
|---|---|---|---|
| Unsere Vision | 735 px | Zeilen | 471 px |
| Unser Anliegen | 699 px | Zeilen, linksbündig, Haarlinien | 589 px |
| Unser Angebot | 1.007 px | Klappliste | 345 px |
| Wer dahinter steht | 463 px | nebeneinander, Porträts 112 px | 150 px |

Startseite am Handy: **7.816 px → 5.569 px**, also knapp 29 Prozent kürzer.
Kein Wort wurde geändert, kein Textblock entfällt — die Erklärtexte im
Angebot stehen in der Klappliste und sind mit einem Tipp da.

Nicht gewählt und wieder entfernt: Kacheln ohne Erklärtext, „nur die drei
Titel", Personen als Zeilen, Vision als Kacheln, Klappliste und
Zweispalter. Ebenso die Beschriftungen und `.vv-compare`.

**Zu bedenken bleibt:** Die Klappliste im Angebot zeigt sechs Titel, die
Erklärsätze erscheinen erst beim Antippen. Regel 3 ist da streng. Die FAQ
auf „Unser Ansatz" arbeiten aber schon so, es funktioniert ohne Hover, ohne
JavaScript und bei Tastaturbedienung. Die sechs Titel — darunter
„Kontinuität für Team & Kunden" und „Absolute Diskretion" — stehen
weiterhin sichtbar da.

### Kontrolle

- Am Desktop ist keiner der `.m-*`-Blöcke sichtbar (0 von 4).
- Abschnittshöhen bei 1280 px unverändert: Vision 170, Anliegen 220,
  Angebot 648, Personen 203; Seite 4.685 px.
- Screenshot bei 1280 px gegen den Stand vor Schritt 27 Pixel für Pixel
  verglichen: Unterschiede nur zwischen y = 52 und 346, das ist der
  Videobereich im Hero. Alles darunter ist identisch.
- Zwischendurch war die Vision-Zeilenfassung am Desktop zusätzlich zu
  sehen, weil `.m-rows` außerhalb des Vergleichs-Containers steht und keine
  eigene Grundregel hatte. Behoben: Alle vier `.m-*`-Blöcke sind
  grundsätzlich `display:none` und werden erst unter 900 px eingeschaltet.

---

## 26 — Kontaktseite entfällt, Aufräumen (22.09.2026)

Julias Entscheidungen nach der Durchsicht der ganzen Website.

### Kontaktseite entfällt — samt Telefonnummern

Die Route `kontakt` ist gelöscht. **Auf der ganzen Website entfallen damit:**

- H1 „Lassen Sie uns sprechen", Eyebrow „Kontakt", Lead „Vertraulich,
  unverbindlich und auf Augenhöhe. …"
- „Direkter Draht" / „Ihr Erstgespräch: Ein E-Mail genügt" samt beiden
  Einleitungssätzen
- **alle drei Telefonnummern** (Jörgen Oberkofler, Lorenz Ambrosius,
  Jakob Scherzenlehner) — ausdrückliche Anweisung: keine Telefonnummer
  irgendwo auf der Seite
- **Jakob Scherzenlehner** kommt damit auf der Website nicht mehr vor
  (löst Hinweis 2 in `content/inhalte.md`)
- der Abschlusssatz „Jedes Gespräch bleibt vertraulich, heute und in jedem
  weiteren Schritt." — er steht weiterhin in FAQ 4

Der Verweis „Kontakt" ist aus der Fußzeile entfernt; in der Kopfzeile stand
er ohnehin nie. Alte Links auf `#kontakt` landen auf der Startseite.

*Abweichung, die du kennen sollst:* `CLAUDE.md`, Regel 3 verlangt
Telefonnummern als sichtbaren Text, weil diese Zielgruppe anruft. Die
Website hat jetzt nur noch die E-Mail-Adresse und das Formular. Die
Entscheidung ist getroffen, der Widerspruch ist hier vermerkt.

### Weitere Entscheidungen

- **Kopfzeilen-Button immer Navy.** Vorher war er bis zum ersten Scrollen
  weiß auf weißem Grund und dadurch nicht als Schaltfläche erkennbar. Damit
  entfällt die gesamte `scrolled`-Logik (Scroll-Listener, `data-solid`).
  Nebenbei behoben: Im aufgeklappten Menü unter 900 px stand der Button
  dunkelblau auf dunkelblau, sobald man gescrollt hatte.
- **Rollenzeile beim Beirat entfernt** („Experte für AI"). Damit tragen
  Team und Beirat einheitlich nur Name und Text.
- **KI statt AI** im Beiratstext („KI- und Automatisierungsprojekten").
- **Mitarbeiter statt Mitarbeitende** in der Fußzeile.
- **Symbol für „Digital & effizient"** auf der Startseite ist jetzt dasselbe
  wie für „KI & Digitalisierung" auf Über uns. Das Chip-Symbol steht nur
  noch für „Aufbau von Systemen & Prozessen".
- **Abschluss-Block wieder unter den FAQ** auf „Unser Ansatz" (Schritt 21
  rückgängig). Unser Ansatz: Bild → Ablauf → Herausforderungen → FAQ → CTA.
- **Bildnachweise:** Die Zeile „Kontakt – Kopfbereich" (Unsplash, Dan V) ist
  entfernt, weil das Bild nicht mehr vorkommt. Im Einleitungssatz darüber
  entfällt damit der Unsplash-Teil — es sind jetzt ausschließlich
  iStock-Bilder und eigene Porträts.

### Altlasten entfernt

Ohne sichtbare Änderung, nur Ballast:

| | vorher | nachher |
|---|---|---|
| Datei | 77,4 KB | 56,8 KB |
| Schrift-Regeln | 35 `@font-face` | 2 |
| CSS-Zeilen | 433 | 319 |

- **Schriften:** Inter liegt als variable Datei vor, eine Datei deckt 400–800
  ab. Die Regeln für kyrillisch, griechisch und vietnamesisch sind weg.
- **Totes CSS:** Treppen-Collage, `hl-*` (alte Herausforderungs-Zeilen),
  `strengths*`, `duo`, `pill`, `navy-band`, `contact-*`, `sol-label`,
  `logo-light`, `crit-num`.
- **Doppelte Regeln zusammengelegt:** `.tinted`, `.criteria`,
  `.criterion ul li::before`, `#anliegen`-Abstand (dreimal definiert),
  `.promise*`, `.ch-card*`/`.ch-split`, `.hv-team`/`.hv-side`.
- **Inline-Stile entfernt, die per `!important` überschrieben wurden:** die
  vier grauen Bänder trugen im HTML `#F2F6F7`, sichtbar war `#E7EEF1`. Der
  Ablauf-Abschnitt hatte sein Raster inline, deshalb brauchte die
  Mobilfassung vier `!important`. Beides ist jetzt normales CSS
  (`.ablauf-grid`, `.photo-band`, `.cta-note`).
- **Nicht mehr verwendete Dateien** liegen in
  [`../archive/unused/`](../archive/unused/):
  fünf Schriftdateien, `logo-light.png`, `kontakt-hero.jpg`,
  `jakob-scherzenlehner.jpg`.

**Offen:** Auf „Unser Ansatz" steht „Der Weg zu uns" jetzt zweimal — über
dem Ablauf und über dem Abschluss-Block. Eine der beiden Zeilen sollte
entfallen.

---

## 25 — Impressum und Datenschutz in der Fußzeile verschoben (22.09.2026)

Beide Links stehen jetzt in der Fußzeilen-Spalte **„Kontakt"** unter
kontakt@manereal.at (auf jeder Seite). Aus der untersten Zeile neben dem
Copyright sind sie entfernt — dort steht nur noch „© 2026 Manereal. Alle
Rechte vorbehalten."

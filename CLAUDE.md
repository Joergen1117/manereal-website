# CLAUDE.md — Manereal Website

Projektregeln für alle Arbeiten in diesem Repository.

---

## Was hier entsteht

**2–3 vollständig getrennte Design-Entwürfe** für die Website von
Manereal. Julia wählt am Ende einen davon aus — oder Elemente daraus.
Bis dahin konkurrieren die Entwürfe miteinander und dürfen sich nicht
gegenseitig beeinflussen.

Die Aufgabe ist **rein visuell**. Inhalte, Texte und Struktur sind
gesetzt und werden übernommen (Regel 6).

| Ebene | Ort | Gilt für |
|---|---|---|
| Sachlage | [PRODUCT.md](PRODUCT.md) | alle Entwürfe |
| Wortlaut | [brief/inhalte.md](brief/inhalte.md) | alle Entwürfe |
| Assets | [brief/assets/](brief/assets/) | alle Entwürfe |
| Gestaltung | [designs/NN-name/](designs/) | genau einen Entwurf |

---

## Regel 1 — Isolation der Entwürfe (nicht verhandelbar)

Beim Arbeiten an einem Entwurf gilt **ausschließlich**:

- `PRODUCT.md`, `brief/inhalte.md`, `brief/assets/` — das Gemeinsame
- `designs/NN-name/CLAUDE.md` — die Regeln dieses einen Entwurfs
- `designs/NN-name/DESIGN.md` — die Design-Tokens dieses einen Entwurfs

**Verboten:** Dateien anderer Entwurfsordner lesen, deren Farben, Fonts,
Sektionsanordnung, Komponenten oder Effekte übernehmen, oder "wie in
Entwurf 2" als Begründung verwenden.

*Warum:* Drei Entwürfe, die voneinander wissen, konvergieren zwangsläufig
zum gleichen Kompromiss. Der Wert von drei Entwürfen liegt genau darin,
dass sie sich widersprechen. Julia soll zwischen echten Alternativen
wählen, nicht zwischen drei Farbvarianten derselben Idee.

Ein Entwurfsordner muss autark sein: löscht man die anderen zwei,
funktioniert er unverändert weiter.

## Regel 2 — Geteiltes bleibt designfrei

`PRODUCT.md` und `brief/` enthalten **Fakten und Inhalte**, niemals
Design-Entscheidungen. Keine Farbwerte, keine Fonts, keine
Layout-Vorgaben. Sobald eine Aussage gestalterisch ist, gehört sie in
das `DESIGN.md` eines Entwurfs.

Umgekehrt: Inhaltliche Fakten werden **nicht** in Entwurfsordner
kopiert, sondern aus `brief/` bezogen. Ändert sich ein Fakt, darf er nur
an einer Stelle geändert werden müssen.

## Regel 3 — Wer die Seite besucht und warum

Manereal betreibt ein **Rollup**: Es kauft Hausverwaltungen in
Österreich auf. Die Website richtet sich an **Inhaber solcher
Betriebe** — nicht an Mieter, nicht an Wohnungseigentümer.

Diese Person kommt über einen **Outreach** von Manereal, googelt den
Namen und landet hier. Sie ist typischerweise 55–75 Jahre alt, verkauft
ihr Lebenswerk und ist misstrauisch. Sie prüft: *Ist das seriös, oder
will mich hier jemand über den Tisch ziehen?*

Daraus folgt für jede gestalterische Entscheidung:

**Verboten:**
- Conversion-Rhetorik, Dringlichkeit, Pop-ups, Newsletter-Overlays,
  Exit-Intent, Zähler, "nur noch heute"
- Startup-Signale: Gradient-Meshes, Glassmorphism, Neon auf Dunkel,
  animierte Blobs, schwebende 3-D-Objekte
- Interfaces, die man "erkunden" muss: versteckte Navigation,
  Hover-abhängige Inhalte, Scroll-Hijacking, Parallax-Ketten,
  Text der erst beim Scrollen erscheint
- Inter, Poppins, Montserrat als Hauptschrift — die Defaults, an denen
  man KI-Gestaltung erkennt. Der Erstentwurf verwendet Inter.

**Geboten:**
- Fließtext ab 18 px, Zeilenlänge 60–75 Zeichen, Kontrast über
  WCAG AA hinaus (Ziel: 7:1 für Fließtext)
- Telefonnummern und E-Mail-Adresse als sichtbarer Text, nicht nur als
  Icon oder Link. Diese Zielgruppe ruft an.
- Jede Interaktion muss ohne Hover funktionieren (Touch, Tastatur)
- `prefers-reduced-motion` respektieren, Bewegung sparsam und nie als
  Voraussetzung für Lesbarkeit

Ein Entwurf darf gerne mutig und außergewöhnlich sein — aber nie auf
Kosten der Lesbarkeit oder der Ruhe. **Ruhe ist hier ein Feature.**

## Regel 4 — Die fünf Fragen

Jeder Entwurf wird daran gemessen, wie schnell er diese Fragen
beantwortet. Sie stehen in dieser Reihenfolge im Kopf des Besuchers:

1. Wer sind diese Leute?
2. Was passiert mit meinen Mitarbeitern und Kunden?
3. Ist das Geld da?
4. Erfährt jemand davon?
5. Verliere ich die Kontrolle?

Die tragende Säule ist **die Person, die verantwortet**. Es gibt keine
Zahlen zur Gruppe, keine Referenzen und keine Auszeichnungen, die diese
Arbeit übernehmen könnten. Gestaltung, die Portraits klein macht oder
nach unten schiebt, arbeitet gegen das Ziel der Seite.

## Regel 5 — Assets

- `uploads/` ist **Rohmaterial** (iStock, 5–17 MB pro Datei). Wird
  niemals direkt eingebunden. Ausgeliefert werden nur optimierte
  Ableitungen aus `brief/assets/`.
- Entwurfsspezifische Assets: `designs/NN-name/assets/`.
- Bildlizenzen sind vor Veröffentlichung zu klären, nicht danach.

## Regel 6 — Wortlaut ist gesetzt, Auswahl ist Gestaltung

Der Auftrag ist **Gestaltung**. Der Wortlaut in
[brief/inhalte.md](brief/inhalte.md) ist verbindlich.

**Am Text selbst wird nichts geändert:** nicht umformulieren, nicht
einzelne Wörter streichen, nicht ergänzen, nicht "verbessern", keinen
Blindtext ersetzen, keine Überschriften umschreiben, keine Platzhalter
in Rechtstexten füllen. Was verwendet wird, wird **wörtlich**
verwendet.

**Weglassen ist dagegen erlaubt und ausdrücklich gewollt:** Ganze
Textfelder, Blöcke und Sektionen dürfen entfallen oder auf eine andere
Seite wandern. Die Zielgruppe soll wenig Text auf viel Fläche
vorfinden, nicht alles auf einmal.

Die Grenze verläuft also so:

| | |
|---|---|
| Ein ganzer Block entfällt | erlaubt |
| Ein Block wandert auf eine andere Seite | erlaubt |
| Reihenfolge von Blöcken ändern | erlaubt |
| Aus sechs Punkten werden drei gezeigt | erlaubt |
| Innerhalb eines Blocks Wörter streichen | **verboten** |
| Zwei Blöcke zu einem zusammenfassen | **verboten** |
| Einen Satz neu formulieren | **verboten** |

Ein entnommener Leitsatz ist eine Auswahl, keine Formulierung — er darf
aus dem Bestand herausgelöst und groß gesetzt werden.

Jeder Entwurf hält in seinem `DESIGN.md` fest, **welche** Blöcke er
weglässt und wohin sie wandern. Was auf keiner Seite mehr vorkommt,
wird dort ausdrücklich benannt, damit die Entscheidung überprüfbar
bleibt.

Fällt inhaltlich etwas auf, wird es unter "Hinweise zur Weitergabe" in
`brief/inhalte.md` notiert — nicht eigenmächtig geändert.

## Regel 7 — `index.html` im Root ist Altbestand

Die [index.html](index.html) im Wurzelverzeichnis ist der 5,4 MB große
Erstentwurf (gebündeltes Artifact). Ihr **Inhalt** ist gesichert und
gilt (Regel 6). Ihre **Gestaltung** ist gesichert in
[_archiv/erstentwurf-design.md](_archiv/erstentwurf-design.md).

Kein Entwurf liest die `index.html` selbst — die Datei ist ein
Bundle mit eingebetteten Base64-Assets und als Vorlage unbrauchbar.

Für die gestalterische Referenz gilt eine Abstufung:

- **Entwurf 1** orientiert sich bewusst an der Formensprache des
  Erstentwurfs und darf `_archiv/erstentwurf-design.md` lesen.
- **Alle anderen Entwürfe** dürfen diese Datei **nicht** lesen. Sie
  sollen radikal andere Haltungen entwickeln, und das gelingt nicht,
  wenn die alte Formensprache im Kopf sitzt.

Die Datei nicht verschieben oder löschen ohne Rückfrage — möglicherweise
öffentlich erreichbar. Der Datenschutztext nennt Vercel als Hosting,
was gegen eine aktive GitHub-Pages-Auslieferung spricht.

---

## Technischer Rahmen

Noch nicht entschieden (siehe [PRODUCT.md](PRODUCT.md), Offene Punkte).
Bis dahin: jeder Entwurf ist eine eigenständige, statische Seite ohne
Build-Schritt und ohne Framework — damit die Entwürfe vergleichbar
bleiben und die Technikwahl nicht vorwegnehmen.

## Sprache

- Seiteninhalte: Deutsch, Österreich — exakt nach `brief/inhalte.md`.
- Code, Kommentare, Token-Namen, Dateinamen: Englisch.
- Dokumentation und Antworten an Julia: Deutsch.

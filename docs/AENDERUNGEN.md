# Änderungsprotokoll der Website

Die Website ist [index.html](../index.html) im Wurzelverzeichnis. Jede
Änderung wird hier festgehalten, damit nachvollziehbar bleibt, was
Gestaltung ist und was Inhalt betrifft (CLAUDE.md, Regel 6).

**Ab Schritt 29.** Die Schritte 0 bis 28 beschrieben die frühere
Ordnerstruktur (`original/`, `Bilder_Personen/`, `Bilder_Stock/`), die
es seit Schritt 29 nicht mehr gibt. Sie wurden am 24.09.2026 aus diesem
Protokoll entfernt und stehen weiterhin in der Git-Historie.

---

## 46 — Video: Standbild bei reduzierter Bewegung, `preload` (02.10.2026)

Auf Anweisung von Julia.

- **Reduzierte Bewegung:** Ist am Gerät „Bewegung reduzieren“
  eingestellt (`prefers-reduced-motion`), zeigt der Kopfbereich der
  Startseite nur das Standbild `hero-still.jpg`. Das Video wird dann
  weder abgespielt noch geladen (CLAUDE.md, Regel 3). Bisher blendete
  die Einstellung nur den Splash aus.
- **`preload="metadata"`** statt `preload="auto"` am Video. Solange
  `autoplay` gesetzt ist, lädt der Browser trotzdem so viel, wie er zum
  Abspielen braucht — die Ladezeit sinkt erst mit einer kleineren Datei.

Offen: `hero-video.mp4` ist 17,3 MB groß und wird neu komprimiert.

Nur Markup-Attribut und Skript in [index.html](../index.html), kein
CSS, kein Wortlaut.

---

## 45 — Auffindbarkeit: robots.txt, Seitentitel, Eckdaten im Kopf (02.10.2026)

Auf Anweisung von Julia.

- **[robots.txt](../robots.txt)** neu: alles frei lesbar, nur `/api/`
  gesperrt (ein Bot-Abruf von `/api/track` würde als Besuch gezählt).
  `/auswertung` steht bewusst nicht darin — die Seite trägt `noindex` per
  Header, und die robots.txt ist öffentlich.
- **Seitentitel** (Wortlaut, Regel 6): „Manereal Hausverwaltung – Ihr
  Lebenswerk. Unsere Verantwortung.“ wird zu „Hausverwaltung verkaufen –
  Nachfolge in Österreich | Manereal“. Die Titel der übrigen Bereiche
  enden auf „| Manereal“ statt „– Manereal Hausverwaltung“. In
  [content/inhalte.md](../content/inhalte.md) nachgezogen.
- **Im `<head>`**, unsichtbar: `canonical` auf `https://manereal.at/`,
  Open-Graph-Angaben für die Link-Vorschau, strukturierte Daten
  (`Organization`, `WebSite`). Die strukturierten Daten nennen bewusst
  keine Gesellschaft, Anschrift, Firmenbuch- oder UID-Nummer — die
  Gesellschaft wird noch geändert und ist dann nachzutragen.

- **[sitemap.xml](../sitemap.xml)** neu, eine Adresse; in der robots.txt
  eingetragen. Gedacht zum Einreichen in der Google Search Console.
- **Beschreibung** (`description`, Wortlaut): neu „Sie möchten Ihre
  Hausverwaltung verkaufen oder die Nachfolge regeln? Manereal übernimmt
  Hausverwaltungen in Österreich – diskret, fair bewertet, mit
  Kontinuität für Team und Kunden.“ Der sichtbare Lead-Satz im
  Kopfbereich bleibt.
- **Überschriften** (Wortlaut):
  - Startseite: über dem Leitsatz die Sachzeile „Nachfolge und Verkauf
    Ihrer Hausverwaltung in Österreich“, als Teil der `h1`
    (`.h1-kicker`, einzige CSS-Änderung). Der Leitsatz selbst bleibt.
  - Unser Ansatz: „Ihre Hausverwaltung in guten Händen“ wird zu
    „Hausverwaltung verkaufen – in guten Händen“.
  - FAQ: „Was Verkäufer uns am häufigsten fragen“ wird zu
    „Hausverwaltung verkaufen: die häufigsten Fragen“.
- **Logo-Alternativtext**: „Manereal“ statt „Manereal Hausverwaltung“ —
  das Wort steht nicht mehr im Logo.

Bewusst nicht gemacht: versteckter Text mit Suchbegriffen (verstößt
gegen Googles Spam-Richtlinien) und eigene Adressen je Bereich.

**Nachtrag am selben Tag:**

- Die Seite wird unter `manereal.at` ausgeliefert, `www.manereal.at`
  leitet dorthin weiter (307). `canonical`, Sitemap, robots.txt und
  strukturierte Daten zeigen deshalb auf `https://manereal.at/`.
- **Fließtext** (Wortlaut), je wenige Wörter ergänzt:
  - „Wir suchen Unternehmer, …“ wird zu „Wir suchen Inhaber von
    Hausverwaltungen, deren Lebenswerk wir weiterführen dürfen“
    (Desktop- und Handy-Fassung).
  - Unser Ansatz, Einleitung: „… Ihre Hausverwaltung verkaufen und in
    guten Händen wissen?“
  - FAQ: „Muss ich meine Hausverwaltung sofort ganz verkaufen?“, „Wie
    lange dauert der Verkauf einer Hausverwaltung?“, „Was ist meine
    Hausverwaltung wert, und wie wird der Kaufpreis ermittelt?“ Die
    Antworten sind unverändert.
- **Fünf neue FAQ** (jetzt 14): Ablauf des Verkaufs, kein Nachfolger,
  welche Hausverwaltungen, Kunden nach dem Verkauf, wer hinter Manereal
  steht. Die Antworten enthalten keine neuen Aussagen; sie sind aus
  Sätzen zusammengesetzt, die an anderer Stelle der Seite stehen
  (Kriterien, Ablauf, Versprechen, Über Manereal). Ändert sich dort
  etwas, sind diese Antworten mitzuziehen.

---

## 43 — Kontaktformular: Fehlertexte je Fehlerfall (02.10.2026)

Auf Anweisung von Julia. Bisher gab es eine einzige Meldung für alles;
bei leerem Name oder leerer E-Mail erschien gar kein Text.

**Am Feld** (rot umrandet, Text darunter, Cursor im ersten Feld mit
Fehler; die Meldung verschwindet beim Weitertippen):

- Name fehlt: „Bitte tragen Sie Ihren Namen ein.“
- E-Mail fehlt: „Bitte tragen Sie Ihre E-Mail-Adresse ein, damit wir
  Ihnen antworten können.“
- E-Mail unvollständig: „Diese E-Mail-Adresse scheint nicht vollständig
  zu sein. Bitte prüfen Sie die Schreibweise.“ Geprüft wird mit
  demselben Muster wie in `api/kontakt.js`; lehnt der Server trotzdem
  ab (422), erscheint derselbe Text.

**Im Kasten über der Schaltfläche:**

- Keine Verbindung: „Es besteht gerade keine Internetverbindung. Bitte
  versuchen Sie es in einem Moment erneut. Ihre Eingaben bleiben
  erhalten.“
- Zu viele Versuche (429): „Bitte warten Sie eine Minute und senden Sie
  die Anfrage dann erneut.“
- Alles Übrige: der bisherige Text mit der E-Mail-Adresse, unverändert.

Dazu `maxlength` an allen Feldern in der Länge, auf die der Server
ohnehin kürzt — es wird nichts mehr stillschweigend abgeschnitten.

`api/kontakt.js` ist unverändert. Die Texte sind neuer Wortlaut und
stehen nur in [index.html](../index.html).

---

## 42 — Impressum: Bildnachweise mit Urhebernamen (02.10.2026)

Auf Anweisung von Julia, nach Abgleich mit den vier iStock-Produktseiten.
Asset-Nummern, Motive, Platzierungen und Lizenztyp stimmten bereits.

1. **Urheber** — die Spalte „Urheber:in“ nennt jetzt den Namen in der
   Form „iStock.com/Name“ statt „iStock (Getty Images)“:
   2172622017 Dmytro Kosmenko (Video), 539457550 gradyreese,
   2184295789 skynesher, 1436951314 jacoblund.
2. **Beirat** — „Team und Beirat“ wird zu „Team“, im Einleitungssatz und
   in der Tabelle. Die Beirat-Sektion ist derzeit auskommentiert; kommt
   sie zurück, gehört der Beirat hier wieder dazu.

**Offen:** Die Produktseiten belegen das Lizenzangebot, nicht den Kauf.
Rechnung oder Download-Verlauf aus dem iStock-Konto ablegen.

An Gestaltung und Markup-Struktur wurde nichts geändert.

---

## 41 — Impressum: Anschrift und Geschäftsführung korrigiert (01.10.2026)

Zwei inhaltliche Korrekturen auf Anweisung von Niklas Gruber, beide im
Impressum von [index.html](../index.html) und in
[content/inhalte.md](../content/inhalte.md) nachgezogen:

1. **Anschrift** — die Zeile „Gruber Umzüge“ entfällt. Es bleiben
   Firmenwortlaut, Straße und Ort.
2. **Geschäftsführung** — Niklas Gruber statt Claus Gruber.
3. **Rechtsform** — „Kommanditgesellschaft“ statt „Gesellschaft mit
   beschränkter Haftung“. Der Firmenwortlaut lautet „Ges.m.b.H & CoKG“;
   die bisherige Angabe widersprach ihm.

**Offen:** Ob Geschäftsführung, Rechtsform und Firmenbuchnummer so im
Firmenbuch stehen, ist nicht gegengeprüft — vor Veröffentlichung mit
einem Firmenbuchauszug abgleichen.

An Gestaltung, Markup-Struktur und Datenschutzerklärung wurde nichts
geändert.

---

## 40 — Das Dashboard weiß jetzt, was vor dem Klick geschah (28.09.2026)

**An der Website selbst wurde nichts geändert.** [index.html](../index.html) ist
unberührt — kein Markup, kein CSS, kein Skript. Dieser Schritt betrifft
ausschließlich das Dashboard unter `/auswertung` und die Doku.

### Warum

Das eigene Tracking beginnt beim **Klick auf den Link**. Alles davor war
geraten: `contacts.sent_at` kam aus der hochgeladenen CSV und sagte, was geplant
war, nicht was hinausging. Bounces, Abmeldungen und Antworten sah das Dashboard
gar nicht — `contacts.optout_at` wurde gelesen, aber von keiner Codestelle
beschrieben.

Seit dem 28.09.2026 holt [`api/instantly.js`](../api/instantly.js) diese Strecke
täglich um 5 Uhr aus der Instantly-API nach. Schema, Abgleich und Cron standen
bereits; dieser Schritt macht die Zahlen **sichtbar**.

### Der Trichter hat vorn zwei Stufen dazubekommen

```
in der Datenbank → tatsächlich versendet → zugestellt → Link aufgerufen
→ davon Mensch → zwei Seiten oder mehr → Erstgespräch → Formular
```

Die erste Stufe hieß bisher „E-Mails versendet" und meinte in Wahrheit „steht in
der Datenbank". Jetzt sind es zwei verschiedene Zahlen, und **die Klickrate
rechnet gegen das Zugestellte** statt gegen die Liste: Wer nie eine Mail bekommen
hat, darf die Rate nicht drücken. Dieselbe Trennung in der Kampagnen-Tabelle.

„geantwortet", „gebounct" und „abgemeldet" stehen **neben** dem Trichter. Eine
Antwort ist kein Zwischenschritt zum Formular, sondern ein zweiter Weg zum
selben Ziel — und eine Abmeldung ist gar kein Fortschritt.

### Die Spalte „Mail" erklärt, warum jemand unten steht

*unbekannt · offen · versendet · gebounct · abgemeldet · geantwortet.* Nicht
aufgerufen ist etwas anderes als nie zugestellt, und bisher sah beides gleich
aus. Im Detailblatt steht die Mail-Chronik **vor** den Besuchen, weil sie
zeitlich davor liegt.

### Der einzige neue Irrtum, und was ihn entschärft

Ein täglicher Abgleich statt eines Webhooks führt einen Irrtum ein: **Eine leere
Zelle liest man als „nicht versendet", obwohl sie „noch nicht abgeglichen"
heißt.** Dagegen drei Dinge:

- Über jeder Ansicht mit Mail-Zahlen steht der **Zeitpunkt des letzten
  Abgleichs**. Ist er älter als anderthalb Tage, färbt sich die Zeile — dann hat
  der Cron nicht gewartet, dann läuft er nicht.
- Ein Kontakt, den der Abgleich nie gesehen hat, trägt **`unbekannt`** statt
  `offen`, mit gestricheltem Rand statt einer Farbe: kein Ergebnis, sondern
  dessen Fehlen.
- In der Kampagnen-Tabelle steht bei „versendet" ein **Strich**, solange nie
  abgeglichen wurde. Eine Null behauptete etwas.

### Was der erste echte Lauf zutage gefördert hat

Von **134 Leads** im Instantly-Arbeitsbereich tragen nur **67** die Custom
Variable `Token` — und es sind **zweimal dieselben 67 Personen**, in zwei
Kampagnen. Alle 67 Adressen stehen in beiden und alle 67 in unserer Datenbank:

| Kampagne | Zustand | Sequenz | Token |
|---|---|---|---|
| `Manereal Burgenland` | Entwurf | keine | **nein** |
| `julian_test_01` | pausiert | Betreff „TEST 01" | ja |

**Die Kampagne, die hinausgehen soll, ist die ohne Token.** Würde ihre Sequenz
geschrieben und gestartet, sammelte das Tracking nichts — genau der stille
Fehler, vor dem [UMSTELLUNG-INSTANTLY.md](UMSTELLUNG-INSTANTLY.md) warnt. Vor
der ersten Welle zu richten.

Damit diese Meldung nicht zur Gewohnheit wird, **unterscheidet der Abgleich jetzt
zwei Fälle**: Ein Lead ohne Token, dessen Adresse *nicht* in `contacts` steht,
gehört einer fremden Kampagne und wird grau gezählt. Steht sie dort, ist es
unsere Person mit fehlender Zuordnung — und das steht rot, oben in der
Übersicht. Die Adressen werden dafür nur verglichen, nie gespeichert.

### Der Abgleich hält jetzt bis zur echten Wellengröße durch

Er machte **eine SQL-Runde je Lead, nacheinander**. Gegen Neon kostet eine Runde
rund 62 ms — bei 67 Kontakten sind das 8 Sekunden, bei den 2.000 bis 3.000
Betrieben des österreichischen Markts **fünf bis sechs Minuten**. Vercel bricht
nach `maxDuration: 30` ab, mitten im Schreiben und ohne dass `sync_state` je
erreicht würde. Der Abgleich funktionierte bisher nur, weil die Liste klein ist.

Jetzt wird in **Stapeln zu 500** geschrieben, über `unnest` statt Zeile für
Zeile: zwei Runden je Stapel. Gemessen: dieselben 134 Leads in **1,2 statt 8
Sekunden**, und die Laufzeit hängt kaum noch an der Listengröße.

### Eine Export-Spalte hieß, was sie nicht ist

Sie nannte `versendet_am`, was Instantly als `timestamp_last_contact`
herausgibt — den **letzten** Versand, nicht den ersten, und er wandert mit jedem
Sequenzschritt mit. Heißt jetzt `zuletzt_versendet_am`. Die einzelnen Versände
stehen in der Chronik des Detailblatts.

### Geändert

| Datei | was |
|---|---|
| [`api/auswertung.js`](../api/auswertung.js) | `abgleichStand()`, Mail-Zahlen im Trichter, Mail-Spalten bei Personen und im Detailblatt, fünf neue Export-Spalten, Aktion `?a=stand` |
| [`api/instantly.js`](../api/instantly.js) | Schreiben in Stapeln statt je Lead, `ohneTokenEinordnen()` — fremd oder eigen |
| [`auswertung.html`](../auswertung.html) | Trichter, Spalte *Mail*, Mail-Chronik, Knopf *Jetzt abgleichen*, Stand-Balken, CSS für beides |
| [`docs/TRACKING.md`](TRACKING.md) | neuer Abschnitt *Was Instantly beisteuert*, zwei ENV-Variablen, Dashboard-Abschnitt nachgezogen |
| [`docs/UMSTELLUNG-INSTANTLY.md`](UMSTELLUNG-INSTANTLY.md) | CSV-Kopfzeile berichtigt: `Email,Firstname,Lastname,Company,Token` statt `Email,Name,Company,Link` |
| [`docs/INSTANTLY-ANBINDUNG.md`](INSTANTLY-ANBINDUNG.md) | Status auf *gebaut*, `dedupe_key`-Widerspruch aufgelöst, Prüfprotokoll |

### Kontrolle

Gegen die echte Datenbank und die echte Instantly-API geprüft: alle sechs
Abfragen antworten mit 200, das Dashboard rendert alle fünf Reiter ohne eine
einzige Konsolenmeldung, bei 390 px Breite gibt es kein Querscrollen, und der
Abgleich lief von Hand durch (134 Leads, 67 zugeordnet, 0 Änderungen, 1,2 s).
Die drei neuen SQL-Formen — mehrarmiges `unnest` mit leeren Zeitstempeln und
`jsonb`, der Stapel-Update gegen `contacts`, der Adressvergleich in
Kleinschreibung — einzeln gegen die Datenbank geprüft, bevor sie schreiben
durften.

**Ungeprüft bleibt alles, was einen echten Versand voraussetzt** — ein
`sent`-Ereignis, ein Bounce, eine Antwort, eine Abmeldung. Es ist noch keine
Mail hinausgegangen, alle 67 Kontakte stehen auf `offen`, und `mail_events` ist
leer. Das steht so in [INSTANTLY-ANBINDUNG.md](INSTANTLY-ANBINDUNG.md) unter
*Prüfung*.

---

## 39 — Das Tracking ist live (25.09.2026)

`Tracking` ist nach `main` gemergt und ausgeliefert. Bis heute lag das gesamte
Tracking nur auf einem Vorschau-Branch: Die Produktionsseite hatte kein
Mess-Snippet, `/api/track` und `/auswertung` antworteten mit 404. **Ab diesem
Zeitpunkt erhebt die Website Daten.**

Ein Fast-Forward, neun Commits. Der Merge hat auch die Löschungen aus `26b5bfa`
nach `main` gebracht — `designs/`, `archive/erstentwurf.html`,
`archive/unused/`, fünf iStock-Rohdateien, `_tmp/`, `docs/00-handoff.md`. Sie
bleiben über `b2b927e` in der Historie erreichbar (CLAUDE.md, Regel 7: von Julia
am 25.09.2026 freigegeben).

**Sichtbar geändert hat sich an der Website genau eine Stelle:** Abschnitt 4 der
Datenschutzerklärung. Aus „Diese Website verwendet keine Cookies zu Analyse-
oder Marketingzwecken." werden fünf Absätze unter der Überschrift
„4. Cookies und Reichweitenmessung": was erfasst wird, dass die IP-Adresse nicht
gespeichert wird, die Kennung im persönlichen Mail-Link samt Widerspruchsrecht,
Neon als Auftragsverarbeiter, Löschfrist 24 Monate.

**Dieser Text ist ein Entwurf und rechtlich noch zu bestätigen.** Der Vermerk
steht als Kommentar direkt darüber in [`index.html`](../index.html), die offenen
Punkte in [TRACKING.md](TRACKING.md). Julia hat den Live-Gang in diesem Wissen
freigegeben. Kein CSS, kein Layout, keine Struktur wurde berührt.

Was dazukam, ohne sichtbar zu sein: das `__mr`-Script im Head, das `?m=` aus der
Adresszeile entfernt, und der Messblock am Ende — beide passiv, ohne Einfluss auf
Darstellung oder Bedienung.

| Was | Wo |
|---|---|
| Die Seite läuft unter | `manereal-website.vercel.app`, später `www.manereal.at` |
| Dashboard | `/auswertung`, passwortgeschützt, für Suchmaschinen gesperrt |
| Weiterentwickelt wird auf | `main` — der Branch `Tracking` ist nach dem Merge gelöscht, lokal und am Remote |

---

## 38 — Der Reiter „Verkehr" heißt „Traffic" (25.09.2026)

Nur der Name, keine Funktion. Sichtbar geändert: die Reiterbeschriftung, die
Überschrift der ersten Karte und die Legende („übriger Traffic").

Die internen Bezeichner bleiben deutsch — `data-tab="verkehr"` im HTML und die
Abfrage `a=verkehr` in der API. Sie sind nirgends sichtbar, und eine Umbenennung
hätte beide Dateien gleichzeitig treffen müssen, damit niemand einen Unterschied
bemerkt.

| Datei | Änderung |
|---|---|
| [`auswertung.html`](../auswertung.html) | Reiter, Kartenüberschrift, Legende, Ablesung |
| [`api/auswertung.js`](../api/auswertung.js), [`db/schema.sql`](../db/schema.sql) | nur Kommentare |
| [`docs/TRACKING.md`](TRACKING.md), [`docs/INSTANTLY-ANBINDUNG.md`](INSTANTLY-ANBINDUNG.md) | Abschnitt und Verweise |

---

## 37 — Reiter „Verkehr" im Dashboard (24.09.2026)

An der Website selbst nur eine Zeile geändert, der Rest betrifft das
Dashboard.

Die bisherigen Reiter zeigen ausschließlich, was aus dem Outreach kommt: Der
Trichter und die Personenliste filtern auf Besuche mit Mail-Code. Wer über
Google, LinkedIn oder direkt hereinkommt, war bis auf eine Zahl in der
Übersicht unsichtbar. Der neue Reiter zeigt den gesamten Verkehr.

| Datei | Änderung |
|---|---|
| [`auswertung.html`](../auswertung.html) | neuer Reiter zwischen „Seiten" und „Verwaltung": Kurve über 7/14/30 Tage, Kennzahlen, Herkunft, Gerät und Land, Log der jüngsten 200 Besuche |
| [`api/auswertung.js`](../api/auswertung.js) | neue Abfrage `a=verkehr`. Die bestehenden Abfragen sind unverändert. |
| [`db/schema.sql`](../db/schema.sql) | Index `visits_started_at`, dazu ein Nachzug für alte `gmass`-Zeilen |
| [`index.html`](../index.html) | `herkunft = 'gmass'` → `'instantly'` |

**Das Chart ist selbst gezeichnetes SVG.** Keine Chart-Bibliothek: Sie wäre
für zwei Linien die mit Abstand größte Abhängigkeit des Projekts, und das
Dashboard ist eine einzelne Datei ohne Build-Schritt. Am Handy wechselt die
Zeichenfläche das Format, weil ein 760 Punkte breiter Kasten sonst auf die
Hälfte zusammenschrumpft und die Achsenbeschriftung unlesbar wird.

**Abgelesen wird ohne Hover.** Ein Tippen auf eine Tagesspalte schreibt die
Zahlen in eine Zeile unter dem Chart, statt sie in einem Kasten am Mauszeiger
zu zeigen. Am Finger ist das die einzige Art, die funktioniert.

**`gmass` ist weg.** Der Versand läuft seit Schritt 35 über Instantly, das
Mess-Snippet trug aber noch den alten Namen ein. Sichtbar wurde das erst
durch die neue Herkunfts-Tabelle. Bestehende Zeilen zieht die letzte Zeile in
`db/schema.sql` nach.

### Offen

- `db/schema.sql` muss einmal gegen die Neon-Datenbank laufen, sonst fehlt
  der Index und die alten `gmass`-Zeilen bleiben stehen.
- Die Abfragen sind nicht gegen echte Daten gelaufen: `DATABASE_URL` ist
  lokal leer, und es gibt kein Postgres auf dem Rechner. Geprüft sind die
  Oberfläche gegen erfundene Daten und die Chart-Mathematik.

---

## 36 — Ordner aufgeräumt (24.09.2026)

Kein Eingriff an der Website: `index.html`, `assets/`, `api/` und
`vercel.json` sind unverändert. Alle 16 Assets, die die Seite lädt,
wurden nach dem Aufräumen einzeln gegengeprüft.

Gelöscht wurde, was die Seite nicht mehr braucht. Der Arbeitsordner
schrumpft von rund 124 MB auf 68 MB. Alles steht weiterhin in der
Git-Historie.

| Gelöscht | Größe | Grund |
|---|---|---|
| `_tmp/` | 32 MB | 110 Screenshots und Variantenvergleiche vergangener Sitzungen. Stand in `.gitignore`, war aber eingecheckt. |
| `.playwright-mcp/`, `.gstack/` | 321 KB | Sitzungsdateien, ebenfalls fälschlich eingecheckt — darunter `terminal-internal-token` |
| `archive/unused/` | 1,3 MB | fünf nie verwendete Inter-Schnitte, drei Bilder der entfallenen Kontaktseite |
| `archive/erstentwurf.html` | 5,3 MB | Base64-Bündel, als Vorlage unbrauchbar. Wortlaut, Gestaltung und Rechtstexte sind separat gesichert. |
| 5 × `archive/source-images/` | 36 MB | Rohbilder ohne Eintrag in den Bildnachweisen, dazu die identische Kopie `iStock-1436951314-7ecef730.jpg` |
| `designs/` | 1,3 MB | Entwurf `01-fassade` und die Vorlage. Die Seite im Wurzelverzeichnis ist die Entscheidung. |
| `content/assets/wien-von-oben-*.webp` | 540 KB | wurden ausschließlich von `designs/01-fassade/` geladen |
| `docs/00-handoff.md` | — | Stand vom 19.09.2026; die dort offenen Entscheidungen sind alle gefallen |
| `original/` | — | leerer Ordner |

Aus diesem Protokoll sind die Schritte 0 bis 28 entfallen. Sie
beschrieben die Ordnerstruktur vor Schritt 29.

### Offen

`CLAUDE.md` geht weiterhin von konkurrierenden Entwürfen in `designs/`
aus (Regeln 1, 2 und 7). Mit dem Ordner ist diese Grundlage entfallen;
die Datei ist noch nicht nachgezogen.

### Geändert

- `.vercelignore` — Eintrag `designs/` entfernt
- `archive/README.md` — beschreibt den neuen Bestand
- `docs/AENDERUNGEN.md` — gekürzt, dieser Eintrag

---

## 35 — Alle vier Personen auf der Startseite (24.09.2026)

Der Abschnitt „Wer dahinter steht“ zeigte bisher nur Jörgen Oberkofler
und Lorenz Ambrosius. Niklas Gruber und Julian Pils standen ausschließlich
auf „Über uns“. Jetzt stehen auf beiden Seiten dieselben vier Personen.

Die Startseite führt zwei getrennte Fassungen des Blocks, eine für den
Desktop und eine für das Handy (`.m-people2`, seit Schritt 29). Beide
wurden ergänzt:

- **Desktop:** aus `.team-2` (zwei Spalten, max. 820 px) wird die neue
  Klasse `.team-4` — vier Spalten à 218 px auf 1040 px Breite, alle vier
  Portraits in einer Reihe. Eine Reihe statt zwei mal zwei, damit keine
  Rangfolge entsteht: Die Portraits tragen hier nur Namen, keine Texte.
- **Handy:** `.m-people2` bleibt zweispaltig und füllt sich mit den zwei
  weiteren Personen zu einem 2×2-Raster, 156 px je Spalte. Der
  Zeilenabstand steht auf `--s-grid` (48 px) statt auf `--s-text`
  (16 px): Mit 16 px klebten die Namen von Jörgen und Lorenz an den
  Portraits der zweiten Reihe und lasen sich wie deren Bildunterschrift.
  Der Spaltenabstand bleibt bei 16 px, damit die Paare als Reihe
  zusammenhängen.

Geprüft auf 1440 px und 390 px: Spalten gleich breit, Reihen bündig, kein
Name bricht um, kein horizontaler Overflow.

### Geändert

- `index.html` — Abschnitt `#wer-dahinter`, beide Fassungen; CSS `.team-4`
  neu, die Handy-Regel blendet jetzt `.team-4` statt `.team-2` aus
- `content/inhalte.md` — Zeile 111, Namen der Startseite

---

## 34 — Eigener Text für Julian Pils (24.09.2026)

Unter dem Portrait von Julian Pils stand seit dem 23.09.2026 wortgleich
der Absatz von Niklas Gruber — eine Übergangslösung auf Julias
Anweisung. Die Seite behauptete damit, Julian Pils habe die Grand Garage
gegründet. Jetzt steht dort sein eigener Text:

> Julian entwickelt Automatisierungen für Kleinbetriebe und baut die
> Datengrundlage, von der ihre Zuverlässigkeit am Ende abhängt. Sein
> Antrieb ist es, Technik dorthin zu bringen, wo sie den Arbeitsalltag
> spürbar entlastet und den Menschen Zeit für ihre eigentliche Arbeit
> zurückgibt.

282 Zeichen und damit im Korridor der anderen drei (Jörgen 249, Lorenz
285, Niklas 298). Der Text lässt die Eröffnung „seit über X Jahren“
bewusst weg, die alle anderen tragen: eine kleinere Zahl neben 12, 10 und
5 hätte die Aufmerksamkeit auf die Berufsjahre gelenkt statt auf die
Arbeit.

Zwei Entscheidungen von Julia während der Formulierung: Die Technische
Universität München wird **nicht** genannt — mit Studium und
Datenarchitektur wäre der Absatz auf 335 Zeichen gewachsen und sichtbar
aus der Reihe geragt. Und „Klein- und Mittelbetriebe“ wurde zu
„Kleinbetriebe“: Die Zielgruppe der Seite ist selbst einer. Der Begriff
„Datenarchitektur“ wurde verworfen, weil er gegenüber dieser Zielgruppe
Distanz schafft; „Datengrundlage“ sagt dasselbe ohne Fachvokabular.

Der Name des Datenanbieters, bei dem Julian Pils an der Aufbereitung von
Datenbeständen für KI gearbeitet hat, kommt im Text nicht vor. Ein
nachschlagbarer Firmenname wäre nach dem Vorbild von Niklas Grubers
Absatz das stärkere Signal; er kann jederzeit ergänzt werden.

Damit ist Hinweis 21 in `content/inhalte.md` erledigt. Offen bleibt
Hinweis 20 (zwei namenlose Fachleute im Hausverwaltungsteam) und Hinweis
22 (das Portrait ist ein Bühnenfoto).

### Geändert

- `index.html`, Zeile 885 — Absatz unter dem Portrait Julian Pils
- `content/inhalte.md` — Zeile 239 und Hinweis 21

---

## 33 — Vierte Person im Team, Trennstrich, Niklas gekürzt (23.09.2026)

### Julian Pils kommt dazu

Das Team zeigt jetzt vier statt drei Personen. Das bisherige Raster war
`repeat(3,1fr)` — die vierte Person hätte allein in einer zweiten Reihe
links gestanden. Stattdessen greift die bereits vorhandene Klasse
`team-2`, daraus wird ein 2×2. Kein neues CSS, nur eine zusätzliche
Klasse im Markup. Am Handy ändert sich nichts, dort steht ohnehin alles
untereinander.

Vier nebeneinander wurde verworfen: die Textspalten wären auf rund
255 px geschrumpft, und Regel 4 hält fest, dass kleine Portraits gegen
das Ziel der Seite arbeiten.

**Portrait.** Julia hat zwei Dateien geliefert, beide dasselbe Motiv:
ein Bühnenfoto mit Mikrofon. `Julian_Pils_01.jpeg` (587 × 887) und
`Julian_pils_02.jpeg` (1600 × 1600). Verwendet wird 02 — 01 ist bereits
in der Kamera so eng beschnitten, dass der Kopf selbst im größtmöglichen
quadratischen Ausschnitt 39 % der Höhe einnimmt. Die übrigen Portraits
liegen bei 28 %, gemessen an Niklas Gruber.

Der ausgelieferte Zuschnitt: Ausschnitt 1446 × 1446 ab (60|57),
heruntergerechnet auf 600 × 600 → `assets/images/people/julian-pils.jpg`.
Damit sitzt der Kopf bei 28 % und das Gesicht bei 51 % der Bildbreite.
Weiter zentrieren geht nicht, ohne die zweite Person im Hintergrund
sichtbar werden zu lassen. Die beiden Originale liegen nach Regel 5 in
`archive/source-images/`.

### Trennstrich sitzt jetzt vor dem Beirat

Er war ein `border-top` auf `.hv-team` und trennte damit die Portraits
vom Hausverwaltungsteam — also innerhalb eines Abschnitts. Auf Julias
Hinweis steht er jetzt als `::before` auf `#beirat .container` und
trennt Team von Beirat, zwei verschiedene Personenkreise. Breite
(1000 px), Farbe (`--line`) und Abstand (56 px beidseitig) unverändert.

### Niklas Gruber gekürzt

Von 466 auf 298 Zeichen, Text von Julia. Nebeneffekt: Alle vier Karten
stehen jetzt auf exakt 427 px. Vorher war die untere Reihe des 2×2
546 px hoch und damit 119 px höher als die obere.

### Offen — vor Veröffentlichung zu klären

**Unter Julian Pils steht wortgleich der Absatz von Niklas Gruber.** Auf
Julias ausdrückliche Anweisung vom 23.09.2026, bis der echte Text
vorliegt. Der jetzige Stand behauptet damit, Julian Pils habe die Grand
Garage gegründet und bei Holcim die Digitalisierung verantwortet. Das
ist in `content/inhalte.md` als Hinweis 21 festgehalten und **muss vor
einem Livegang ersetzt werden**. Deshalb ist dieser Stand committet,
aber nicht deployed.

---

## 32 — Texte „Über uns", Timeline-Umbruch, Video-Ecken (23.09.2026)

Fünf Änderungen auf Julias Anweisung. Drei betreffen den Wortlaut, zwei
die Darstellung.

**Wortlaut** (Julias Texte, wörtlich übernommen; `content/inhalte.md`
ist mitgezogen, damit Regel 2 hält):

1. **Niklas Gruber** — der Blindtext des Erstentwurfs ist ersetzt. Damit
   steht auf der Website kein Lorem ipsum mehr. Hinweis 1 in „Hinweise
   zur Weitergabe" ist erledigt.
2. **„Team an Hausverwaltern" → „Hausverwaltungsteam"**.
3. **Text des Hausverwaltungsteams** — neu gefasst, von drei Absätzen auf
   zwei. Der dritte Absatz („Dieses Wissen fließt direkt in unseren
   Ansatz ein …") entfällt ersatzlos. Hinweis 9 („Partner aus
   Fachleuten") ist damit erledigt.

Zwei neue Hinweise sind dabei entstanden und in `content/inhalte.md`
notiert, nicht eigenmächtig geändert: „gewerberechtlich zertifiziert"
(in Österreich heißt das Gewerbeberechtigung, § 94 Z 35 GewO) und die
jetzt ausdrücklich genannten „zwei" Fachleute, die weiterhin ohne Namen
und Portrait bleiben.

**Darstellung:**

4. **Zeilenabstand der Timeline-Überschriften** („Der Weg zu uns").
   `.tl-step h3` hatte keine eigene `line-height` und erbte die 1.65 des
   Fließtexts — bei 18,5 px sind das 30,5 px je Zeile. Am Laptop fiel das
   nicht auf, weil die Überschriften einzeilig stehen; am Handy brechen
   „Vertrauliches Kennenlernen" und „Konzept und indikatives Angebot" um
   und die zwei Zeilen standen weit auseinander. Jetzt `line-height:1.25`
   → 23,1 px. Gilt für alle fünf Schritte.

5. **Flackernde Ecken des Hero-Videos.** Das Video läuft auf einer eigenen
   GPU-Ebene. Diese Ebene beschneidet der Browser beim Neuzeichnen nicht
   zuverlässig am runden Rand des Elters (`border-radius` +
   `overflow:hidden`) — dann blitzen für einzelne Frames eckige Ecken auf.
   Ein bekanntes Verhalten mobiler Browser, kein Fehler der Videodatei.
   Drei Maßnahmen: `.hero-media` wird per `transform:translateZ(0)` selbst
   zur GPU-Ebene und per `isolation:isolate` zu einem eigenen
   Kompositions-Kontext, Video und Verlaufs-Overlay tragen den Radius über
   `border-radius:inherit` zusätzlich selbst. Damit ist die Ecke auch dann
   rund, wenn der Beschnitt des Elters aussetzt.

   **Nicht** umgesetzt wurde der Vorschlag, das Video als GIF in
   Endlosschleife einzubinden. Ein GIF kennt nur 256 Farben (sichtbare
   Streifen im Abendhimmel), wäre als Datei um ein Vielfaches größer als
   die 17,7 MB der MP4, wird ohne Hardware-Unterstützung dekodiert und
   lässt sich nicht anhalten — womit `prefers-reduced-motion` (Regel 3)
   nicht mehr erfüllbar wäre. Vor allem aber löst es die Ursache nicht:
   der Beschnitt am runden Rand ist unabhängig davon, was in der Ebene
   liegt.

**Offen geblieben, nicht Teil des Auftrags:** Das Hero-Video wird
unabhängig von `prefers-reduced-motion` abgespielt. Regel 3 verlangt,
diese Einstellung zu respektieren. Und mit 17,7 MB ist die Datei für
eine Zielgruppe, die die Seite auch mobil aufruft, zu schwer.

---

## 31 — Formular scheiterte an Brevos IP-Sperre (23.09.2026)

*Die Nummer 30 ist doppelt vergeben: An diesem Tag haben zwei Sitzungen
parallel an der Seite gearbeitet und beide einen Eintrag geschrieben.*

Nach dem Livegang meldete das Formular bei jedem Absenden einen Fehler.
Die Funktion antwortete mit `502 send_failed` — also waren die
Umgebungsvariablen gesetzt (sonst käme `500 not_configured`), aber Brevo
lehnte ab. Die Begründung stand nur im Laufzeit-Log von Vercel.

Sichtbar gemacht mit einem vorübergehenden Schalter: Mit `?diag=1` gab
die Funktion Brevos Antwort zurück. Sie lautete:

> 401 — „We have detected you are using an unrecognised IP address
> 3.120.133.183."

**Ursache:** Im Brevo-Konto war die IP-Beschränkung aktiv. Der
API-Schlüssel durfte nur von bekannten Adressen benutzt werden. Vercels
Funktionen laufen aber unter ständig wechselnden Adressen aus dem
Rechenzentrum Frankfurt. Einzelne IPs einzutragen hilft deshalb nicht.

**Behoben:** Julia hat die Beschränkung unter
`app.brevo.com/security/authorised_ips` abgeschaltet. Testversand kam mit
`200 {"ok":true}` durch. Der Diagnose-Schalter ist wieder entfernt.

Nicht die Ursache waren, entgegen der ersten Vermutung: gleiche Adresse
für `MAIL_FROM` und `MAIL_TO` (erlaubt), der Absender (verifiziert) und
der Schlüssel selbst.

**Geblieben ist eine Kleinigkeit:** Die drei Umgebungsvariablen werden
jetzt getrimmt. Beim Einfügen in Vercel wandert leicht ein Leerzeichen
mit, und der Schlüssel wäre dann ohne erkennbaren Grund ungültig.

**Offen:** In Brevo ist die Domain `manereal.at` weder mit DKIM noch mit
DMARC hinterlegt. Für den Versand an die eigene Adresse egal, für Mails
an Interessenten nicht — Gmail und Outlook sortieren solche Nachrichten
schnell als Spam aus.

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


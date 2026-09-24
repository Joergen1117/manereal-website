# Tracking und Auswertung

Wie die Messung auf manereal.at funktioniert, wie eine Outreach-Welle
vorbereitet wird und wie die Zahlen zu lesen sind.

Stand 24.09.2026.

---

## In einem Satz

Die Website misst, wer aus dem Outreach den Link öffnet, welche Seiten die
Person wie lange liest und ob sie am Ende ein Erstgespräch anfragt — **ohne
Cookie, ohne Banner und ohne die IP-Adresse zu speichern**.

---

## Einmalige Einrichtung

### 1. Datenbank anlegen

In Vercel → Projekt → **Storage** → Marketplace → **Neon**, Region
**Frankfurt (eu-central-1)**. Der Gratis-Tarif reicht: Eine Outreach-Welle
erzeugt ein bis zwei Megabyte gegen 500 Megabyte Freikontingent.

Vercel setzt `DATABASE_URL` danach automatisch als Environment-Variable.

### 2. Tabellen einspielen

Im SQL-Editor von Neon den Inhalt von [`db/schema.sql`](../db/schema.sql)
einfügen und ausführen. Drei Tabellen entstehen: `contacts`, `visits`,
`events`.

### 3. Environment-Variablen setzen

Vercel → Projekt → Settings → Environment Variables:

| Variable | Wert | wofür |
|---|---|---|
| `DATABASE_URL` | setzt Neon selbst | Datenbank |
| `AUSWERTUNG_PASSWORT` | frei wählbar | Anmeldung am Dashboard |
| `AUSWERTUNG_SECRET` | langer Zufallsstring, 40+ Zeichen | signiert die Anmeldung |
| `SEITEN_URL` | `https://manereal.at` | baut die Links |
| `TRACKING_PERSONENBEZUG` | leer lassen | `0` schaltet die Personenzuordnung ab |

`AUSWERTUNG_SECRET` erzeugen:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

### 4. Ausliefern

`git push joergen main` — nicht `origin`. Nur das joergen-Remote löst den
Redeploy aus.

Danach ist das Dashboard unter **manereal.at/auswertung** erreichbar. Der
Pfad ist nirgends verlinkt und für Suchmaschinen gesperrt.

---

## Eine Welle vorbereiten

**1. Kontaktliste als CSV speichern.** Erkannt werden diese Spalten — unabhängig
von Schreibweise, Bindestrichen und Leerzeichen:

| Spalte | Pflicht | wird erkannt als | Beispiel |
|---|---|---|---|
| E-Mail | **ja** | `email`, `E-Mail`, `mail` | max@mustermann.at |
| Vorname | nein | `firstname`, `Vorname` | Max |
| Nachname | nein | `lastname`, `Nachname` | Mustermann |
| Unternehmen | nein | `company`, `Firma` | Hausverwaltung Mustermann GmbH |
| Versanddatum | nein | `sent_at`, `versendet` | 2026-10-12 |

**Alle weiteren Spalten werden unverändert durchgereicht** und stehen in
Instantly als Variablen zur Verfügung. Wer eine Spalte `Branche` oder
`Einheiten` mitliefert, kann damit personalisieren, ohne dass hier etwas
anzupassen wäre.

Komma oder Semikolon als Trennzeichen, beides wird erkannt.

**2. Im Dashboard unter „Verwaltung" einspielen.** Kampagne eintragen (z. B.
`welle-2-wien`), Datei wählen, einspielen. Es lädt sofort
`instantly-welle-2-wien.csv` herunter:

```
Email,Firstname,Lastname,Company,Token,Branche,Einheiten
herta.wolf@wo.at,Herta,Wolf,"Wolf, Huber & Partner KG",WCVYSNY2NH,Wohnbau,220
```

Komma-getrennt und ohne BOM — genau so, wie Instantly es braucht. Die Kampagne
steht **nicht** in der Datei; sie bleibt auf unserer Seite und gruppiert nur die
Auswertung.

**Ein wiederholter Upload ist harmlos.** Dieselbe Adresse darf in mehreren
Wellen stehen, aber nicht zweimal in derselben. Ein zweiter Upload derselben
Datei legt nichts doppelt an und liefert dieselben Tokens wie beim ersten Mal.

**3. In Instantly importieren.** Beim Zuordnen: `Email` → Email,
**`Token` → Custom Variable**. Der Rest nach Bedarf.

**4. Den Link in die Signatur setzen — in der Code-Ansicht `<>`.**

```html
<a href="https://www.manereal.at/?m={{Token}}">www.manereal.at</a>
```

**Die Code-Ansicht ist Pflicht, nicht Geschmackssache.** Im normalen Editor
wird die Variable nicht ersetzt; am 24.09.2026 in Instantly geprüft. Das deckt
sich mit dem offenen Feature-Wunsch auf Instantlys Board: Der betrifft die
Link-Maske des normalen Editors, die keine Variablen anbietet. Die Ersetzung
selbst läuft über den Quelltext und greift dort auch in Attributen.

**Und danach nicht mehr im normalen Editor öffnen.** Wer den Schritt später
dort bearbeitet, riskiert, dass der Editor den Link beim Zurückwechseln
umschreibt. Nach jeder Änderung an dieser Sequenz also in der Code-Ansicht
nachsehen, ob `{{Token}}` noch dasteht.

Sichtbar steht die Domain, dahinter liegt der persönliche Code. Weil Anzeige
und Ziel dieselbe Domain haben, ist das für Spam-Filter unauffällig — ein
Query-Parameter löst nichts aus.

**5. Fünf Schalter prüfen.** Siehe unten. Drei davon entfernen das HTML und
damit den Link, ohne dass man es merkt.

Für Listen jenseits weniger tausend Zeilen geht es auch auf der Kommandozeile
— dasselbe Ergebnis, dieselbe Funktion:

```
DATABASE_URL=… node scripts/links-erzeugen.js kontakte.csv welle-2-wien
```

---

## Die fünf Schalter in Instantly

Alle fünf gehören **aus**. Kampagne → Options, der letzte in den globalen
Einstellungen.

| Schalter | warum aus |
|---|---|
| *Send emails as text-only* | entfernt das HTML — der Link verschwindet |
| *Send first email as text-only* | dasselbe, nur für die erste Mail |
| *Always send first email as text-only* (global) | dasselbe, kampagnenübergreifend |
| *Link Tracking* | schreibt die Adresse auf eine fremde Tracking-Domain um |
| *Open Tracking* | Zählpixel: schadet der Zustellung und braucht eine Einwilligung |

**Die ersten drei sind der gefährliche Teil.** Ist einer davon an, bleibt vom
Link nur der sichtbare Text `www.manereal.at` übrig. Die Kampagne läuft, die
Mails kommen an, alles sieht richtig aus — und kein einziger Klick ist einer
Person zuzuordnen. Deshalb: **nach den ersten fünfzig Mails ins Dashboard
sehen.** Stehen dort nur anonyme Aufrufe, ist der Code unterwegs verloren
gegangen.

Zum Öffnungs-Tracking: Die Öffnungsrate ist seit Apple Mail Privacy Protection
ohnehin kaum noch aussagekräftig, und rechtlich ist ein Zählpixel die härtere
Konstellation als unser Link-Code — die Artikel-29-Gruppe hält dafür eine
ausdrückliche Einwilligung für nötig, weil die ePrivacy-Richtlinie vorgeht.
Unser Dashboard weiß ohnehin mehr: nicht nur *ob* geklickt wurde, sondern was
danach gelesen wurde.

---

## Zustellbarkeit — der größte Hebel

Das ist kein Tracking-Thema, beeinflusst die Zahlen aber stärker als alles
andere. Was beim Cold-Outreach passiert — viele verschiedene Absenderadressen,
junge Domains, Links auf eine dritte Domain — ist genau das Muster, auf das
Spam-Filter anschlagen. Bei Instantly mit vielen Postfächern wiegt das schwerer
als bei einem einzelnen Konto.

Vor jeder Welle:

- [ ] **SPF, DKIM und DMARC** für **jede** Absender-Domain eingerichtet.
      Ohne das landet ein Teil der Kampagne nicht im Posteingang.
- [ ] **Keine Kurz-URLs** (bit.ly und Ähnliches werden hart bewertet).
- [ ] **Nur ein Link in der ersten Mail**, und zwar in der Signatur.
- [ ] **Aufwärmphase** der Postfächer abgewartet, bevor Volumen kommt.
- [ ] **Linktext = Ziel.** Die Abweichung zwischen Anzeigetext und
      tatsächlichem Ziel ist ein klassisches Phishing-Merkmal.
- [ ] **Testmail an je eine Outlook-/Microsoft-365-, Gmail- und
      GMX-Adresse.** Kommt sie an? Ist der Link intakt? Landet der Klick im
      Dashboard? Das gehört **vor** die Welle, nicht danach.

---

## Das Dashboard lesen

### Übersicht

Der Trichter zählt **Personen, nicht Besuche**. Wer dreimal wiederkommt,
verdreifacht die Klickrate nicht.

```
E-Mails versendet        180
Link aufgerufen           34      18,9 %
davon Mensch              27      79,4 %
zwei Seiten oder mehr     19      70,4 %
Erstgespräch angeklickt    6      22,2 %
Formular abgeschickt       2       7,4 %
```

**„Davon Mensch" ist die wichtigste Zeile.** Die Link-Scanner der
Mail-Gateways — Microsoft Defender Safe Links, Proofpoint, Mimecast,
Barracuda — rufen jeden Link schon beim Zustellen auf. Sie kommen aus
Rechenzentren und geben sich als ganz normale Browser aus; über den
User-Agent sind sie nicht zu erkennen. Deshalb gilt ein Aufruf erst dann als
Mensch, wenn ein Interaktionssignal eintrifft: Maus bewegt, gescrollt, Taste
gedrückt, berührt, geklickt — oder die Seite bleibt zehn Sekunden lang
sichtbar offen.

Ohne diese Trennung wären die Klickraten um zweistellige Prozentsätze zu
hoch. Genau daran scheitern viele Marketing-Systeme.

Alle Raten rechnen mit der Mensch-Zahl. Die Scanner-Aufrufe werden nicht
weggeworfen, sondern daneben ausgewiesen — ihr Anteil verrät, wie streng die
Mail-Infrastruktur der Angeschriebenen ist.

### Personen

Alle Angeschriebenen einer Kampagne. Oben die mit Besuch, nach Lesezeit
sortiert; darunter die ohne. Damit steht die Klickrate ohne Rechnen vor
Augen. Ein Klick auf eine Zeile öffnet den Verlauf:

```
Max Mustermann · Hausverwaltung Mustermann GmbH · welle-2-wien · Mail 12.10.

Erster Aufruf · 12.10. 14:22 · Mensch (gescrollt) · desktop · AT
  Start            4:29
  Unser Ansatz     7:30
  Über Manereal    1:05
  14:35 — Frage aufgeklappt „Was kostet mich das Erstgespräch?"
  14:36 — Erstgespräch angeklickt (kopfzeile)
```

### Seiten

Wo gelesen und wo abgebrochen wird, welche Fragen aufgeklappt werden, an
welcher Stelle das Erstgespräch angeklickt wird.

Die Tabelle **„Woran ein Mensch erkannt wurde"** ist die Selbstkontrolle des
Systems: Kommt fast alles über „10 Sekunden sichtbar geblieben" herein und
kaum etwas über Maus oder Scroll, sitzen vermutlich Scanner unter den
gezählten Menschen. Dann gehört der Schwellwert nach oben.

---

## Einen Kontakt löschen

Widerspricht jemand der Zuordnung, im Dashboard unter **Personen** die Zeile
öffnen und **Kontakt löschen**.

Name, Unternehmen und E-Mail verschwinden. Die Besuche bleiben **anonym** in
der Statistik — damit ist die Löschaufforderung erfüllt, ohne dass die Zahlen
springen. Technisch sorgt dafür `on delete set null` in
[`db/schema.sql`](../db/schema.sql).

---

## Die Personenzuordnung abschalten

Zwei Schalter, weil einer im Zweifel vergessen wird:

1. In Vercel `TRACKING_PERSONENBEZUG` auf `0` setzen.
2. In [`index.html`](../index.html) im Messblock `PERSONENBEZUG` auf `false`.

Danach werden Besuche weiter gezählt, aber keiner Person mehr zugeordnet.
Bestehende Daten bleiben unverändert.

---

## Was nicht gemessen werden kann

**Anrufe.** Auf der Website steht keine Telefonnummer und kein `tel:`-Link.
Laut [PRODUCT.md](../PRODUCT.md) greift diese Zielgruppe aber lieber zum
Telefon als zum Formular. Der wichtigste Weg zum Erstgespräch ist damit weder
auslösbar noch messbar — **jede Formular-Conversion-Rate ist systematisch zu
niedrig**. Sobald Nummern auf der Seite stehen, kommt ein eigener
Ereignistyp dazu.

**Geöffnete E-Mails.** Dafür bräuchte es ein Zählpixel in Instantly — davon
raten wir ab, siehe oben.

**Weitergeleitete Links zeigen die falsche Person.** Leitet Herr Mustermann
die Mail an seinen Steuerberater weiter, laufen dessen Klicks auf sein Konto.
Bei einer Zielgruppe, die zur Übergabe des Lebenswerks Berater einbindet, ist
das kein Randfall. Nicht lösbar, nur wissbar.

**Ein Neuladen (F5) verliert die Zuordnung.** Der Code wird vor dem ersten
Rendern aus der Adresszeile entfernt, damit er dort nie sichtbar ist. Der
Preis: Nach einem Neuladen zählt der Rest des Besuchs als anonym. Der Teil
davor bleibt vollständig zugeordnet.

---

## Wo was liegt

| Datei | wofür |
|---|---|
| [`db/schema.sql`](../db/schema.sql) | die drei Tabellen |
| [`api/track.js`](../api/track.js) | nimmt die Messpunkte entgegen, gibt nie Daten heraus |
| [`api/auswertung.js`](../api/auswertung.js) | alle Abfragen des Dashboards |
| [`api/_db.js`](../api/_db.js), [`api/_token.js`](../api/_token.js) | Datenbankzugriff, Code-Erzeugung |
| [`auswertung.html`](../auswertung.html) | das Dashboard |
| [`scripts/links-erzeugen.js`](../scripts/links-erzeugen.js) | dasselbe Einspielen auf der Kommandozeile |
| [`index.html`](../index.html) | zwei Stellen: das Snippet im `<head>`, der Messblock am Ende |

---

## Rechtliches

Die Datenschutzerklärung (Abschnitt 4 auf manereal.at) wurde neu gefasst —
der alte Satz „Diese Website verwendet keine Cookies zu Analyse- oder
Marketingzwecken" war durch die Messung sachlich falsch geworden. **Der neue
Abschnitt ist ein Entwurf und rechtlich zu bestätigen.** Die offenen Punkte
stehen in [`content/inhalte.md`](../content/inhalte.md) unter „Hinweise zur
Weitergabe", Nummer 23.

Drei Zusagen sind im Code umgesetzt und mit Browser-Proben belegt:

- **Kein Cookie, kein `localStorage`, kein `sessionStorage`** auf der
  öffentlichen Seite. Deshalb ist kein Einwilligungsbanner nötig. Nachprüfbar
  in den Entwicklerwerkzeugen unter Application, nach einem vollständigen
  Besuch.
- **Die IP-Adresse wird nicht gespeichert.** Sie dient nur der
  Ratenbegrenzung und dem Herkunftsland (zwei Buchstaben).
- **Der Messendpunkt gibt niemals Daten heraus.** Jede Antwort ist `204`
  ohne Inhalt, egal was gefragt wird.

Zur Outreach-Kampagne selbst: In Österreich verlangt **§ 174 TKG 2021** für
Werbe-E-Mails eine vorherige Einwilligung, **auch im B2B** — anders als in
Deutschland. Der Strafrahmen liegt bei bis zu 50.000 € pro Verstoß. Julia hat
am 24.09.2026 bestätigt, dass der Rechtsrahmen geklärt und genehmigt ist;
hier ist es nur vermerkt, damit es nachvollziehbar bleibt.

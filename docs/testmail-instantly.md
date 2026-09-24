# Testmail für Instantly

Zum Kopieren. Empfänger: `Julian@pils.cc`

---

## Was schon geklärt ist

**Instantly ersetzt `{{Token}}` auch mitten in einem `href` — aber nur in der
Code-Ansicht `<>`.** Im normalen Editor funktioniert es nicht. Am 24.09.2026 in
Instantly geprüft.

Damit ist die Frage beantwortet, an der vorher alles hing. Der Code bleibt
hinter `www.manereal.at` verborgen, `?m=` bleibt wie es ist, und am Tracking war
keine Änderung nötig.

Zwei Regeln folgen daraus:

1. **Den Link ausschließlich in der Code-Ansicht setzen.** Nicht über die
   Link-Schaltfläche des normalen Editors — dort wird `{{Token}}` nicht ersetzt
   und geht als Text hinaus.
2. **Den Schritt danach nicht mehr im normalen Editor öffnen.** Ein
   WYSIWYG-Editor schreibt HTML beim Zurückwechseln gern um. Nach jeder Änderung
   an dieser Sequenz in der Code-Ansicht nachsehen, ob `{{Token}}` noch dasteht.

---

## Was die Testmail noch klären soll

Drei Dinge, die die Vorschau im Editor nicht beantwortet:

| | prüft |
|---|---|
| **Quelltext der empfangenen Mail** | Kommt die Ersetzung wirklich bis ins Postfach — oder nur bis zur Vorschau? |
| **Posteingang oder Spam** | Wie schlägt sich eine HTML-Mail mit Link in der Signatur bei den drei großen Filtern? |
| **Die ganze Kette** | Klick auf den Link → steht der Besuch im Dashboard bei der richtigen Person? |

**Ein Hinweis zum Aufbau:** Sichtbar steht `www.jpprocessautomation.de`, das
Ziel ist `manereal-website.vercel.app` — **zwei verschiedene Domains**. Instantly
warnt selbst davor, und im Echtbetrieb wird beides `manereal.at` sein.

Das macht den Test nicht wertlos, nur einseitig: **Kommt die Mail an, ist der
Echtfall erst recht sicher.** Landet sie im Spam, weiß man nicht, ob es an der
Domain-Abweichung lag oder an etwas anderem. Ein Bestehen zählt, ein Scheitern
beweist nichts.

---

## Die Mail

**Betreff**

```
Kurze Frage zu Ihren Prozessen, Julian
```

**Text — in der Code-Ansicht `<>` einfügen, nicht im normalen Editor**

```html
Hallo Julian,<br><br>

ich melde mich kurz bei Ihnen, da wir Unternehmen dabei unterstützen,
zeitaufwendige manuelle Abläufe durch intelligente Prozessautomatisierung
spürbar zu verschlanken.<br><br>

Hätten Sie diese Woche Zeit für einen kurzen, 5-minütigen Austausch dazu?<br><br>

Beste Grüße<br>
Max Mustermann<br>
Prozessberater | JP Process Automation<br>
<a href="https://manereal-website.vercel.app/?m={{Token}}">www.jpprocessautomation.de</a>
```

**Zwei Abweichungen von der Vorlage des Support-Agenten, mit Absicht:**

- **Kein 🌐-Emoji vor dem Link.** Emojis in Signaturen erhöhen den Spam-Score
  leicht. Bei einem Test, der Zustellbarkeit misst, wäre das eine vermeidbare
  Störgröße — und bei dieser Zielgruppe wirkt ein Emoji ohnehin fehl am Platz.
- **„Beste Grüße" ohne Komma.** Nach der deutschen Grußformel steht keines.

---

## Die Leads dafür

Am einfachsten im Dashboard unter *Verwaltung* eine CSV mit einer Zeile
einspielen — dann stimmt das Format von selbst, der Kontakt liegt in der
Datenbank und der Code passt zum Link:

```
email,firstname,lastname,company
Julian@pils.cc,Julian,Pils,JP Process Automation
```

Die zurückgegebene Datei geht direkt nach Instantly. Beim Import zuordnen:
`Email` → Email, **`Token` → Custom Variable**, der Rest nach Bedarf.

---

## Einstellungen, die stimmen müssen

Sonst misst der Test etwas anderes als gemeint:

- [ ] Kampagne → Options → **Send emails as text-only: AUS**
- [ ] Kampagne → Options → **Send first email as text-only: AUS**
- [ ] Global → **Always send first email as text-only: AUS**
- [ ] Kampagne → Options → **Link Tracking: AUS**
- [ ] Kampagne → Options → **Open Tracking: AUS**

**Die drei Text-only-Schalter sind jetzt das einzige verbliebene Risiko.** Ist
einer davon an, wird das HTML entfernt, der Anchor fällt weg und übrig bleibt
nur der sichtbare Text. Die Mail kommt an, sieht richtig aus — **und hat keinen
Link mehr.** Genau dieses stille Versagen soll der Test sichtbar machen.

Link Tracking muss aus sein, weil Instantly sonst die Adresse auf eine eigene
Tracking-Domain umschreibt. Dann prüft man Instantlys Umleitung statt der
eigenen Ersetzung.

---

## Wie das Ergebnis zu lesen ist

**Nicht auf die Anzeige schauen, sondern in den Quelltext.** In Gmail:
Drei-Punkte-Menü → *Original anzeigen*. In Outlook: *Datei → Eigenschaften*
oder die Mail als `.eml` speichern und im Texteditor öffnen.

| Befund im Quelltext | Bedeutung |
|---|---|
| `<a href="https://manereal-website.vercel.app/?m=K7F3M2QX9P">` | **Bestanden.** Die Kette steht bis ins Postfach |
| `<a href="…?m={{Token}}">` | Ersetzung greift nicht — wurde der Link im normalen Editor gesetzt? |
| kein `<a>`, nur `www.jpprocessautomation.de` als Text | HTML wurde entfernt → Text-only-Schalter prüfen |
| Ziel zeigt auf eine fremde Tracking-Domain | Link Tracking war noch an |

**Und danach:** Auf den Link klicken, dann ins Dashboard unter
`/auswertung` → Personen. Steht dort ein Besuch beim richtigen Kontakt, ist die
ganze Kette bewiesen — von der Mail bis zur Auswertung.

Das setzt voraus, dass der Kontakt in der Datenbank liegt. Am einfachsten:
vorher im Dashboard unter *Verwaltung* eine CSV mit dieser einen Zeile
einspielen und die zurückgegebene Datei direkt für Instantly verwenden — dann
stimmt der Code von selbst.

---

## Drei Zustelladressen statt einer

Wenn der Quelltext stimmt, dieselbe Kampagne an je eine Adresse bei
**Microsoft 365 / Outlook**, **Gmail** und **GMX** schicken. Das sind die drei
Filterwelten, in denen österreichische Hausverwaltungen sitzen. Posteingang
oder Spam — das entscheidet mehr über die Kampagne als alles andere in diesem
System.

---

## Im laufenden Betrieb

**Nach den ersten fünfzig Mails ins Dashboard sehen.** Stehen dort nur anonyme
Aufrufe, ist der Code unterwegs verloren gegangen — dann wurde entweder im
normalen Editor gearbeitet oder ein Text-only-Schalter ist an. Das ist die
einzige Kontrolle, die greift, ohne dass jemand daran denken muss.

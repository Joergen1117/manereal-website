# Testmail für Instantly

Zum Kopieren. Klärt die eine Frage, an der alles hängt: **Ersetzt Instantly
eine Lead-Variable auch innerhalb eines `href`?**

Empfänger: `Julian@pils.cc`

---

## Zwei Varianten, zwei verschiedene Fragen

Beide verschicken, nacheinander. Sie beantworten Unterschiedliches.

| | prüft | Antwort sagt aus |
|---|---|---|
| **Variante 1** — feste Adresse | Kommt eine HTML-Mail an, deren sichtbarer Text eine andere Domain zeigt als das Ziel? | Zustellbarkeit unter **erschwerten** Bedingungen |
| **Variante 2** — mit Variable | Wird `{{Token}}` mitten im `href` ersetzt? | **Die eigentliche Frage.** Ohne ein Ja bleibt der Code in der Mail stehen |

Variante 1 ist strenger als die spätere Praxis: Sichtbar steht
`www.jpprocessautomation.de`, das Ziel ist `manereal-website.vercel.app` —
**zwei verschiedene Domains**. Instantly warnt selbst davor, und im Echtbetrieb
wird beides `manereal.at` sein.

Das macht den Test aber nicht wertlos, nur einseitig: **Kommt sie an, ist der
Echtfall erst recht sicher.** Landet sie im Spam, weiß man nicht, ob es an der
Domain-Abweichung lag oder an etwas anderem. Ein Bestehen zählt, ein Scheitern
beweist nichts.

---

## Variante 1 — feste Adresse

**Betreff**

```
Kurze Frage zu Ihren Prozessen, Julian
```

**Text (Code-Ansicht `<>` im Sequenz-Editor)**

```html
Hallo Julian,<br><br>

ich melde mich kurz bei Ihnen, da wir Unternehmen dabei unterstützen,
zeitaufwendige manuelle Abläufe durch intelligente Prozessautomatisierung
spürbar zu verschlanken.<br><br>

Hätten Sie diese Woche Zeit für einen kurzen, 5-minütigen Austausch dazu?<br><br>

Beste Grüße<br>
Max Mustermann<br>
Prozessberater | JP Process Automation<br>
<a href="https://manereal-website.vercel.app/">www.jpprocessautomation.de</a>
```

**Zwei Abweichungen von der Vorlage des Support-Agenten, mit Absicht:**

- **Kein 🌐-Emoji vor dem Link.** Emojis in Signaturen erhöhen den Spam-Score
  leicht. Bei einem Test, der Zustellbarkeit misst, wäre das eine vermeidbare
  Störgröße — und bei dieser Zielgruppe wirkt ein Emoji ohnehin fehl am Platz.
- **„Beste Grüße" ohne Komma.** Nach der deutschen Grußformel steht keines.

---

## Variante 2 — mit Variable (die entscheidende)

Diese läuft nur als **Kampagne mit Lead-Import**, nicht als Handversand — die
Variable braucht eine Tabellenzeile.

### CSV zum Hochladen

Als `testlauf.csv` speichern, **UTF-8, komma-getrennt, ohne BOM** — oder
einfacher: im Dashboard unter *Verwaltung* eine Zeile einspielen und die dort
erzeugte Datei nehmen, dann stimmt das Format von selbst und der Kontakt liegt
gleich in der Datenbank.

```
Email,Firstname,Lastname,Company,Token
Julian@pils.cc,Julian,Pils,JP Process Automation,K7F3M2QX9P
```

Beim Import zuordnen: `Email` → Email, **`Token` → Custom Variable**,
der Rest nach Bedarf.

### Text (Code-Ansicht)

Identisch zu Variante 1, nur die letzte Zeile:

```html
<a href="https://manereal-website.vercel.app/?m={{Token}}">www.jpprocessautomation.de</a>
```

**Das ist die heikelste Form, die es gibt** — die Variable steht *innerhalb*
der URL, innerhalb eines Attributs. Manche Editoren prüfen beim Speichern, ob
der `href` eine gültige Adresse ist, und kodieren die geschweiften Klammern zu
`%7B%7BToken%7D%7D` um. Dann wird nichts ersetzt. Genau deshalb wird getestet.

Fällt der Test hier durch, aber die Ersetzung funktioniert sonst: Dann muss die
Spalte statt des Tokens den **vollständigen Link** enthalten
(`https://manereal.at/?m=K7F3M2QX9P`) und in der Sequenz steht `{{Link}}` als
ganzer `href`. Das ist in
[`api/auswertung.js`](../api/auswertung.js) eine Zeile Änderung.

---

## Einstellungen, die stimmen müssen

Sonst misst der Test etwas anderes als gemeint:

- [ ] Kampagne → Options → **Send emails as text-only: AUS**
- [ ] Kampagne → Options → **Send first email as text-only: AUS**
- [ ] Global → **Always send first email as text-only: AUS**
- [ ] Kampagne → Options → **Link Tracking: AUS**
- [ ] Kampagne → Options → **Open Tracking: AUS**

Die drei Text-only-Schalter sind der Kern: Ist einer davon an, wird das HTML
entfernt, der Anchor fällt weg und übrig bleibt nur der sichtbare Text. Die
Mail kommt an, sieht richtig aus — **und hat keinen Link mehr.** Genau dieses
stille Versagen soll der Test sichtbar machen.

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
| `<a href="https://manereal-website.vercel.app/?m=K7F3M2QX9P">` | **Bestanden.** Der Weg funktioniert, nichts weiter zu tun |
| `<a href="…?m={{Token}}">` | Ersetzung greift nicht im Attribut → Volllink-Spalte oder sichtbarer Pfad |
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

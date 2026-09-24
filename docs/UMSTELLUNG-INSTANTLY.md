# Umstellung von GMass auf Instantly

Was am Tracking geändert werden muss, weil der Outreach über
[Instantly](https://instantly.ai) statt über GMass läuft — und wie der Link in
der Signatur aussehen sollte.

Stand 24.09.2026. **Umgesetzt ist alles, was in beiden Fällen nötig ist** —
siehe unten. Offen bleibt nur, was von der Testmail abhängt. Enthält die
Auskunft des Instantly-Support-Agenten vom 24.09.2026.

---

## Die Lage in drei Sätzen

Es gibt zwei Wege, den persönlichen Code in die Mail zu bekommen. **Weg A**
versteckt ihn hinter dem Text `www.manereal.at` — gebaut und einsatzbereit.
**Weg B** zeigt einen kurzen Pfad (`manereal.at/k7f3mq`), kann nicht
fehlschlagen, kostet aber einen halben Arbeitstag Umbau und ist noch nicht
gebaut.

Welcher es wird, entscheidet **eine einzige Testmail**. Siehe
[testmail-instantly.md](testmail-instantly.md).

### Umgesetzt am 24.09.2026

- Kontakte tragen **Vor- und Nachname getrennt** (`firstname`, `lastname`)
- **Beliebige weitere Spalten** der hochgeladenen Datei werden unverändert
  durchgereicht und stehen in Instantly als Variablen bereit
- Spalten werden **unabhängig von Schreibweise erkannt**, auch deutsch:
  `E-Mail`, `Vorname`, `Nachname`, `Firma`
- Die Datei für Instantly ist **komma-getrennt, ohne BOM**, mit den Spalten
  `Email, Firstname, Lastname, Company, Token` plus Zusatzspalten
- Die Spalte heißt **`Token`** und enthält nur den Code, nicht die Adresse —
  der Link wird in Instantly daraus gebaut
- Die **Kampagne bleibt auf unserer Seite** und steht nicht in der Datei
- Ein **wiederholter Upload** legt nichts doppelt an und liefert dieselben
  Tokens (`unique (email, campaign)`)
- Der Ergebnis-Export für Excel behält Semikolon und BOM
- `scripts/links-erzeugen.js` ruft dieselbe Funktion auf wie das Dashboard —
  es gibt keine zweite Umsetzung derselben Regeln

### Die Entscheidung zur Token-Spalte

Julia hat festgelegt, dass die Spalte **nur das Token** enthält und der Link in
Instantly zusammengebaut wird:

```html
<a href="https://www.manereal.at/?m={{Token}}">www.manereal.at</a>
```

Das ist die heiklere von zwei Formen: Die Variable steht *innerhalb* der URL,
innerhalb eines Attributs. Manche Editoren prüfen beim Speichern, ob der `href`
eine gültige Adresse ist, und kodieren die geschweiften Klammern zu
`%7B%7BToken%7D%7D` um — dann wird nichts ersetzt. Eine Spalte mit dem
**vollständigen Link** hätte dieses Risiko nicht, weil die Ersetzung dann den
ganzen Attributwert austauscht.

Die Testmail deckt genau diese Form ab. Fällt sie durch, ist der Wechsel auf
eine Volllink-Spalte eine Zeile in
[`api/auswertung.js`](../api/auswertung.js).

---

## Was die Instantly-Auskunft geklärt hat

Julia hat den Instantly-Support-Agenten am 24.09.2026 gefragt. Drei Punkte
daraus sind relevant.

### Geklärt: Variablen funktionieren im `href`

> „Als Hyperlink im Text/HTML: `<a href="{{custom_link}}">Hier klicken</a>`
> bzw. als Signatur: `<a href="{{custom_link}}">www.jpprocessautomation.de</a>`
> […] Beim automatischen Versand an hunderte Leads zieht Instantly für jeden
> Empfänger automatisch den individuellen Wert aus der jeweiligen Tabellenzeile."

Das widerspricht dem offenen
[Feature-Wunsch](https://feedback.instantly.ai/p/insert-link-variable-in-hyperlink-format)
auf Instantlys eigenem Board — aber nur scheinbar. Der Wunsch bezieht sich auf
die **Link-Maske im Editor**, die keine Variablen anbietet. Die
Ersetzung selbst läuft offenbar als Textersetzung über die ganze Mail und
greift damit auch in Attributen. Das passt zusammen.

**Trotzdem bleibt die Testmail Pflicht.** Die Auskunft kommt von einem
KI-Support-Agenten, nicht aus der Dokumentation, und widerspricht einem Eintrag
im eigenen Feature-Board. Zwei Minuten Test gegen eine Welle ohne Zuordnung —
das Verhältnis ist eindeutig.

### Geklärt: Gleiche Domain, anderer Parameter ist unproblematisch

> „Wenn der sichtbare Text `www.manereal.at` ist und das Ziel
> `https://www.manereal.at/?m=K7F3M2QX9P`, erkennen Spam-Filter: Gleiche
> Domain […] Kein Phishing-Verdacht."

Damit fällt eine meiner Sorgen weg. Der Filter prüft den **Host**, nicht die
ganze Adresse. Ein Query-Parameter löst nichts aus.

Das hat eine angenehme Folge: **Wenn Weg A funktioniert, bleibt `?m=` wie es
ist.** Der ganze Umbau auf kurze Pfade wird dann nicht gebraucht.

### Bestätigt: Verschiedene Domains sind sehr wohl ein Problem

> „Wenn der sichtbare Ankertext eine Domain darstellt […] das eigentliche Ziel
> aber eine ganz andere Domain ist […], stufen Spam-Filter (wie Google Workspace
> oder Microsoft 365) dies häufig als Phishing oder Täuschungsversuch ein."

Instantly warnt hier von sich aus vor genau der Konstellation, die die geplante
Testmail verwendet (`www.jpprocessautomation.de` → `manereal-website.vercel.app`).
Das ist kein Fehler im Test, macht ihn aber **strenger als die spätere Praxis**
— siehe [testmail-instantly.md](testmail-instantly.md).

### Ergänzend: wenige Links in der ersten Mail

> „Je weniger Links in der allerersten E-Mail (Step 1), desto höher die
> Wahrscheinlichkeit, dass die Nachricht im primären Posteingang landet. Links
> in der Signatur sind üblich und in Ordnung."

Spricht für die Signatur als Ort — genau wie geplant. Und dagegen, im Fließtext
einen zweiten Link zu setzen.

---

## Was die Auskunft **nicht** geklärt hat

Das ist der wichtigere Teil.

### Wird das HTML entfernt, verschwindet der Code spurlos

Instantly kennt drei Schalter, die HTML aus der Mail streichen:

- Kampagne → *Send emails as text-only (no HTML)*
- Kampagne → *Send first email as text-only*
- global → *Always send first email as text-only*

Ist einer davon aktiv, bleibt vom Anchor nur der sichtbare Text übrig:
`www.manereal.at`. Die Kampagne läuft, die Mails kommen an, nichts sieht kaputt
aus — **und kein einziger Klick ist einer Person zuzuordnen.** Der Fehler fällt
erst auf, wenn das Dashboard nach dreihundert Mails ausschließlich anonyme
Aufrufe zeigt.

Das Bittere: Genau diese Einstellung ist die für Zustellbarkeit empfohlene. Die
Instantly-Dokumentation schreibt wörtlich, Plain-Text-Mails schneiden besser ab
als HTML.

**Das ist und bleibt das Hauptargument gegen Weg A.** Der Support-Agent hat es
nicht angesprochen.

### Die Signatur liegt am Sendekonto, nicht am Empfänger

`{{accountSignature}}` zieht die Signatur aus den Einstellungen des jeweiligen
Sendekontos. Ob darin Lead-Variablen ersetzt werden, ist nirgends dokumentiert
— die Hilfe nennt für Signaturen nur Konto-Variablen wie
`{{sendingAccountName}}`.

**Lösung:** Die Signatur **direkt in den Sequenz-Schritt** schreiben statt
`{{accountSignature}}` zu verwenden. Dort funktionieren Lead-Variablen sicher.
Das ist auch das, was die Testmail prüft.

---

## Die beiden Wege im Vergleich

| | **Weg A — versteckt** | **Weg B — sichtbarer Pfad** |
|---|---|---|
| in der Signatur | `www.manereal.at` | `manereal.at/k7f3mq` |
| dahinter | `https://www.manereal.at/?m=K7F3M2QX9P` | dasselbe wie sichtbar |
| Codeänderungen | **keine** (nur CSV-Format) | sieben Stellen, ca. ½ Tag |
| Mailformat | HTML nötig | Plain Text genügt |
| Zustellbarkeit | etwas schlechter | beste |
| Fehlerfall | **still** — Code weg, niemand merkt es | keiner möglich |
| Voraussetzung | Testmail muss bestehen; alle drei Text-only-Schalter aus | keine |

**Meine Empfehlung: Weg A testen, Weg B in der Hinterhand.** Besteht die
Testmail, ist Weg A klar überlegen — er kostet nichts und die Signatur sieht
aus wie jede andere. Besteht sie nicht, ist Weg B schon beschrieben und in
einem halben Tag gebaut.

Was in beiden Fällen gilt: **Nach den ersten fünfzig Mails ins Dashboard
sehen.** Stehen dort nur anonyme Aufrufe, ist der Code unterwegs verloren
gegangen. Das ist die einzige Kontrolle, die im laufenden Betrieb greift.

---

## Was am CSV-Format geändert wurde *(erledigt)*

### [`api/auswertung.js`](../api/auswertung.js)

Instantly stellt andere Anforderungen als Excel. **Zwei Formate statt einem:**

| | Rückgabe nach dem Import (→ Instantly) | Ergebnis-Export (→ Excel) |
|---|---|---|
| Trennzeichen | **Komma** | Semikolon |
| BOM | **keines** | ja (sonst zerlegt Excel die Umlaute) |
| Spaltennamen | **Großbuchstabe am Anfang, max. 20 Zeichen** | wie bisher |
| erste Spalte | **`Email`** | frei |

Kopfzeile der Instantly-Datei:

```
Email,Name,Company,Link
```

`Link` enthält die **vollständige Adresse**, nicht nur den Code. Dann steht in
der Sequenz schlicht `{{Link}}` — und die Frage, ob eine Variable *innerhalb*
einer URL ersetzt wird, stellt sich gar nicht erst. Das ist der Unterschied
zwischen einer Ersetzung im Fließtext, die sicher funktioniert, und einer im
Inneren einer Adresse, die es vielleicht nicht tut.

*Warum kein BOM:* Instantly verlangt UTF-8. Ein BOM kann dazu führen, dass die
erste Spalte als `﻿Email` gelesen wird und das Mapping scheitert.

### Texte *(erledigt)*

[`auswertung.html`](../auswertung.html) Reiter „Verwaltung",
[`docs/TRACKING.md`](TRACKING.md) und
[`scripts/links-erzeugen.js`](../scripts/links-erzeugen.js) beschreiben jetzt
den Instantly-Weg. GMass kommt nirgends mehr vor.

---

## Zusätzliche Änderungen nur für Weg B *(noch nicht gebaut)*

Falls die Testmail scheitert und der Code sichtbar werden muss.

### 1. Kürzere Codes — [`api/_token.js`](../api/_token.js)

`LAENGE` von 10 auf **6**. Sechs Zeichen Crockford-Base32 ergeben rund eine
Milliarde Möglichkeiten; bei einigen tausend Kontakten ist Durchprobieren
sinnlos. Und wer doch einen Code errät, sieht dieselbe Seite wie alle anderen —
**hinter dem Code stehen keine personenbezogenen Daten**, er ordnet nur den
Besuch zu. Da noch keine Welle gelaufen ist, gibt es keine Altlasten.

### 2. Code aus dem Pfad lesen — [`index.html`](../index.html), Snippet im `<head>`

Beide Formen unterstützen, damit alte Links weiter funktionieren:

```js
var pfad = location.pathname.match(/^\/([0-9a-hjkmnp-tv-z]{6})\/?$/i);
var code = pfad ? pfad[1].toUpperCase()
                : new URLSearchParams(location.search).get('m');
if (code) history.replaceState(null, '', '/' + location.hash);
```

### 3. Pfad auf die Seite lenken — [`vercel.json`](../vercel.json)

```json
"rewrites": [
  { "source": "/:code([0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{6})", "destination": "/index.html" }
]
```

Greift nur bei genau sechs Zeichen ohne Schrägstrich. `/auswertung` (zehn
Zeichen), `/api/...` und `/assets/...` bleiben unberührt. **Zu prüfen:** ob
Vercel groß-/kleinschreibungsempfindlich vergleicht — deshalb sind beide
Schreibweisen im Zeichenvorrat.

### 4. Codelänge serverseitig — [`api/track.js`](../api/track.js)

`TOKEN_RE` von `{10}` auf `{6}`.

### 5. Link-Aufbau — [`api/auswertung.js`](../api/auswertung.js), [`scripts/links-erzeugen.js`](../scripts/links-erzeugen.js)

`basis + '/?m=' + token` wird zu `basis + '/' + token`.

---

## Einstellungen in Instantly

### Link Tracking: **aus**

Kampagne → Options → *Link Tracking* abwählen.

Bei eingeschaltetem Tracking schreibt Instantly jede Adresse auf eine
Tracking-Domain um und leitet weiter. Unser Code überlebt das zwar — die
Weiterleitung landet auf der Originaladresse —, aber es kostet dreifach:

- eine fremde Domain steht in der Mail statt `manereal.at`
- ein zusätzlicher Umleitungsschritt, den Spam-Filter bewerten
- ohne eigene Tracking-Domain teilt man sich die Reputation mit allen anderen
  Instantly-Nutzern, auch den schlechten

Der Support-Agent empfiehlt für diesen Fall eine eigene Tracking-Domain
(`track.manereal.at`). Das stimmt — aber wir brauchen Instantlys Klick-Tracking
gar nicht: Unser eigenes Dashboard weiß mehr, nämlich nicht nur *ob* geklickt
wurde, sondern was danach gelesen wurde.

Einzelne Links lassen sich mit `?clicktracking=off` ausnehmen. Bei Weg B würde
das aber genau den Fragezeichen-Anhang in die Signatur schreiben, den wir
loswerden wollen. Also kampagnenweit abschalten.

### Open Tracking: **aus**

Das ist ein Zählpixel. Zwei Gründe dagegen:

- **Zustellbarkeit:** Ein Pixelabruf ist ein Signal, auf das Provider prüfen.
  Instantly nennt das Senden ohne Pixel und ohne Umleitung selbst „naked
  sending" und empfiehlt es für die erste Mail.
- **Recht:** Die Artikel-29-Gruppe hält für Öffnungs-Tracking eine
  ausdrückliche Einwilligung für nötig; berechtigtes Interesse trägt dort
  nicht, weil die ePrivacy-Richtlinie vorgeht. Das ist eine deutlich härtere
  Konstellation als unser Link-Code, den die Person selbst mitbringt.

Die Öffnungsrate ist seit Apple Mail Privacy Protection ohnehin kaum noch
aussagekräftig.

### Text-only

- **Weg A:** alle drei Schalter **aus**, sonst verschwindet der Code.
- **Weg B:** darf eingeschaltet bleiben — es geht nichts verloren. Das ist der
  ganze Vorteil dieser Lösung.

### CSV-Import und Variablen-Mapping

| Spalte | Zuordnung in Instantly |
|---|---|
| `Email` | Email *(Pflicht, erste Spalte)* |
| `Name` | Custom Variable → `{{Name}}` |
| `Company` | Company Name oder Custom Variable |
| `Link` | **Custom Variable** → `{{Link}}` |

Vorgaben: Spaltennamen beginnen mit Großbuchstaben, höchstens 20 Zeichen, keine
Dopplungen, höchstens 50 Variablen pro Upload. Benutzerdefinierte Variablen
dürfen nicht so heißen wie die vordefinierten und sind
groß-/kleinschreibungsempfindlich.

### Zustellbarkeit

Unverändert gegenüber GMass, bei Instantly aber wichtiger, weil mehr Postfächer
im Spiel sind:

- [ ] **SPF, DKIM und DMARC für jede Sendedomain.**
- [ ] Sendedomains mit erkennbarem Bezug zu `manereal.at`.
- [ ] Aufwärmphase abgewartet, bevor Volumen kommt.
- [ ] Keine Kurz-URL-Dienste.
- [ ] Nur **ein** Link in der ersten Mail, und zwar in der Signatur.

---

## Was vor der ersten Welle zu testen ist

| Was | Wie | Erwartung |
|---|---|---|
| **Variable im `href`** | Testkampagne über Instantly an eine eigene Adresse, siehe [testmail-instantly.md](testmail-instantly.md) | Im Quelltext der empfangenen Mail steht die fertige Adresse, nicht `{{Link}}` |
| **HTML überlebt** | dieselbe Mail | Der Text ist ein Link, nicht nur Text |
| **Zustellung** | an je eine Outlook-/Microsoft-365-, Gmail- und GMX-Adresse | Posteingang, nicht Spam |
| **Kein Umschreiben** | Link in der empfangenen Mail ansehen | zeigt auf `manereal.at`, nicht auf eine Tracking-Domain |
| **Zuordnung kommt an** | auf den Link klicken, dann ins Dashboard | Besuch steht bei der richtigen Person |
| **Nach 50 Mails** | Dashboard, Reiter Übersicht | nicht ausschließlich anonyme Aufrufe |

---

## Quellen

- [Variablen in Kampagnen](https://help.instantly.ai/en/articles/6135930-how-to-add-variables)
- [Leads per CSV importieren](https://help.instantly.ai/en/articles/6254215-how-to-import-leads-via-csv)
- [HTML in der Sequenz](https://help.instantly.ai/en/articles/7911973-html-in-email-sequence)
- [Signaturen](https://help.instantly.ai/en/articles/8278149-adding-signatures)
- [Link Tracking](https://help.instantly.ai/en/articles/8030866-link-tracking)
- [Custom Tracking Domain](https://help.instantly.ai/en/articles/6984188-custom-tracking-domain-ctd)
- [Feature-Wunsch: Variablen im Hyperlink](https://feedback.instantly.ai/p/insert-link-variable-in-hyperlink-format) — Status offen
- [Instantly zu Tracking-Pixeln und Zustellbarkeit](https://instantly.ai/blog/email-tracking-and-deliverability-why-tracking-pixels-can-hurt-your-inbox-placement/)
- Auskunft des Instantly-Support-Agenten, 24.09.2026 (oben zitiert)

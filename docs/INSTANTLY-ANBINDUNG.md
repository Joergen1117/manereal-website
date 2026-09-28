# Instantly-Versanddaten ins Dashboard

Stand 28.09.2026. **Gebaut.** Schema, Abgleich, Cron und Dashboard stehen;
offen ist allein der Webhook, und der bleibt es bis zum Tarifwechsel.

| Teil | Stand |
|---|---|
| `db/schema.sql` — `mail_events`, `sync_state`, vier Spalten auf `contacts` | eingespielt |
| `api/instantly.js` — täglicher Abgleich | läuft, erstmals am 28.09.2026 |
| `vercel.json` — Function und Cron `0 5 * * *` | gesetzt |
| Dashboard — Trichter, Spalte *Mail*, Mail-Chronik, Abgleich-Knopf, Export | gebaut am 28.09.2026 |
| Doku — [TRACKING.md](TRACKING.md), [UMSTELLUNG-INSTANTLY.md](UMSTELLUNG-INSTANTLY.md) | nachgezogen |
| `POST /api/instantly?a=hook` — der Webhook | **zurückgestellt**, Tarif |

Das Dokument hält die Entscheidung und den Weg fest, damit beides überprüfbar
bleibt. Der Entwurf für den Webhook steht unverändert darin — er wird gebaut,
wenn der Tarif es zulässt.

**Was der erste Lauf zutage gefördert hat:** Von 134 Leads im Arbeitsbereich
tragen nur **67** die Custom Variable `Token`. Die übrigen sind dem Dashboard
nicht zuzuordnen. Der Abgleich meldet das jetzt von sich aus im Reiter
*Verwaltung*.

---

## Warum

Das eigene Tracking misst alles **ab dem Klick auf den Link**: Aufruf,
Mensch-vs-Scanner, Lesezeit je Seite, Erstgespräch, Formular. Was davor liegt,
ist geraten — `contacts.sent_at` kommt aus der hochgeladenen CSV und sagt nur,
was geplant war, nicht was tatsächlich hinausging. Bounces, Abmeldungen und
Antworten sieht das Dashboard gar nicht; `contacts.optout_at` wird von keiner
Codestelle beschrieben, nur gelesen (`api/track.js:149`).

Instantly kennt diese Ereignisse und gibt sie über API v2 heraus. Ziel ist ein
durchgehender Trichter von „in der Datenbank" bis „Formular abgeschickt", ohne
an der Mail selbst etwas zu ändern.

**Bewusst nicht Teil dieses Vorhabens:** `email_opened` und `link_clicked`.
Beide verlangen, dass Open- bzw. Link-Tracking in Instantly eingeschaltet wird
— das Zählpixel und die umgeschriebene Tracking-Domain sind genau die Signale,
die [UMSTELLUNG-INSTANTLY.md](UMSTELLUNG-INSTANTLY.md) aus guten Gründen
abgeschaltet hat. „Angeklickt" misst das eigene System ohnehin besser, weil es
Scanner vom Menschen trennt, was Instantly nicht tut.

Gearbeitet wird auf `main`. Der Branch `Tracking` ist am 25.09.2026 nach `main`
gemergt und danach gelöscht worden — es gibt nur noch einen Branch.

---

## Verhältnis zum Traffic-Reiter (`961071f`)

Parallel ist ein fünfter Reiter **Traffic** entstanden: Kurve über 7/14/30 Tage,
Herkunft, Gerät, Land, Log der jüngsten 200 Besuche — alles über `visits`, alles
auf `human` gefiltert, ohne Kampagnen- und Datumsfilter
(`api/auswertung.js:416-537`, `auswertung.html:727-1011`).

Er kommt diesem Vorhaben **nicht in die Quere**:

- Er liest ausschließlich `visits` und `events`. Hier wird nach `mail_events`
  und `contacts` geschrieben; `visits` bleibt unberührt.
- Die Funktionen, die geändert werden — `uebersicht()` (232), `personen()`
  (309), `person()` (346) — stehen **vor** dem eingefügten Traffic-Block. Ihre
  Zeilennummern sind unverändert.
- Der Reiter hat eine eigene Router-Verzweigung `?a=verkehr`
  (`api/auswertung.js:738`) und eine eigene Zeitraumlogik; der neue Endpunkt
  `api/instantly.js` ist eine eigene Datei und berührt beides nicht.

Zwei Stellen, die dadurch trotzdem zu beachten sind:

1. **`db/schema.sql` endet mit Nachzug-Anweisungen** (`update visits set
   source = 'instantly' where source = 'gmass'`). Die neue Tabelle gehört
   hinter `events`, die `alter table`-Zeilen zu den Nachzügen ans Dateiende —
   nicht dazwischen, sonst zerfällt die Gliederung der Datei.
2. **Abgemeldete bleiben im Traffic-Reiter sichtbar, und das ist richtig so.**
   Setzt `lead_unsubscribed` künftig `contacts.optout_at`, verweigert
   `api/track.js:146-156` die Zuordnung, der Besuch bekommt also kein Token.
   Der Traffic-Reiter zählt ihn dennoch zur Kampagne, weil `AUS_KAMPAGNE`
   zusätzlich auf `source = 'instantly'` prüft (`api/auswertung.js:437-438`) und
   `sourceOf()` diesen Wert aus dem Browser übernimmt (`api/track.js:66-71`).
   Ergebnis: der Besuch erscheint im Log ohne Namen. Genau so soll es sein —
   die Kurve der Vergangenheit darf sich durch eine Abmeldung nicht rückwirkend
   ändern. Das gehört in die Prüfung, nicht in den Code.

---

## Was der Tarif zulässt (Stand 28.09.2026)

Der Arbeitsbereich läuft auf **Growth**. Damit gilt:

| | |
|---|---|
| API v2, Leads und Kampagnen lesen | **verfügbar** — „API access is available on all Email Outreach plans" |
| Webhooks | **nicht verfügbar** — „available on the Hyper Growth plan or above" |

Die frühere Annahme, API v2 setze Growth voraus und ohne API-Zugang sei nichts
baubar, war in beide Richtungen falsch: Der Lesezugriff liegt tiefer, der
Webhook höher.

**Gebaut wird deshalb nur der Abgleich.** Er ist nicht mehr der Nachzieher
hinter dem Webhook, sondern die einzige Quelle. Was das kostet, ist allein die
Aktualität — die Ereignisse stehen bis zu 24 Stunden später im Dashboard, nicht
binnen Sekunden. Der Trichter selbst verliert keine Stufe.

Drei Endpunkte tragen das:

| Endpunkt | liefert |
|---|---|
| `POST /api/v2/leads/list` | je Person `status` (−1 gebounct, −2 abgemeldet, 1 aktiv, 2 pausiert, 3 fertig), `status_summary`, `email_reply_count`, `timestamp_last_contact`, `timestamp_last_touch`, `esp_code` — und in `payload` unseren Token. **Am 28.09.2026 gegen die echte API geprüft**; ein `timestamp_last_reply`, wie die Doku ihn nennt, existiert nicht — Antworten erkennt nur `email_reply_count` |
| `GET /api/v2/emails` | die einzelnen Mails samt Zeitstempel; daraus wird die Mail-Chronik im Detailblatt. 20 Anfragen je Minute |
| `GET /api/v2/campaigns/analytics` | Summen je Kampagne, als Gegenprobe zum Trichter |

Drei Folgen, die nicht im Code stehen, sondern in der Gestaltung:

1. **Jede Mail-Angabe im Dashboard braucht den Zeitpunkt des letzten
   Abgleichs.** Ohne ihn liest man eine leere Zelle als „nicht versendet",
   obwohl sie „noch nicht abgeglichen" heißt. Das ist der einzige neue Irrtum,
   den dieser Weg einführt — und er gehört sichtbar entschärft, nicht in eine
   Fußnote.
2. **Der Abmeldezeitpunkt ist nicht exakt.** Instantly gibt den Zustand heraus,
   nicht den Moment. `contacts.optout_at` bekommt daher den Zeitpunkt des
   Abgleichs, der die Abmeldung zuerst gesehen hat — im Zweifel bis zu einen Tag
   zu spät. Für die Zuordnungssperre in `api/track.js:146-156` ist das
   unschädlich: sie greift ab diesem Moment, und rückwirkend soll sie ohnehin
   nichts ändern.
3. **Der `dedupe_key` braucht kein HMAC mehr.** Die Verschlüsselung war nur
   da, um die Adresse aus dem Webhook-Payload nicht im Klartext in die Tabelle
   zu schreiben. Der Abgleich liefert den Token, die Adresse kommt gar nicht
   vor — `token|type|ts|step` genügt als Schlüssel. Damit entfällt auch, dass
   eine Rotation von `AUSWERTUNG_SECRET` alte Schlüssel ungültig machen und
   Ereignisse doppelt eintragen könnte.

Der Entwurf für den Webhook bleibt unten stehen. Er wird gebaut, wenn der Tarif
es zulässt — nicht vorher: Ein Endpunkt, den niemand aufrufen kann, lässt sich
auch nicht prüfen.

---

## Was gebaut wird

### 1. Schema erweitern — `db/schema.sql`

Neue Tabelle, im Zuschnitt der bestehenden `events`:

```sql
create table if not exists mail_events (
  id         bigserial primary key,
  token      text references contacts(token) on delete set null,
  campaign   text,
  type       text not null,   -- sent | bounced | unsubscribed | replied | interested
  ts         timestamptz not null,
  step       int,
  meta       jsonb,
  dedupe_key text not null unique
);

create index if not exists mail_events_token on mail_events (token, ts);
```

Zwei Punkte, die nicht verhandelbar sind:

- **Keine E-Mail-Spalte.** Die Adresse wird beim Eingang zu einem Token
  aufgelöst und dann verworfen. `on delete set null` macht die Ereignisse nach
  einer DSGVO-Löschung anonym — dasselbe Verhalten wie bei `visits` heute.
- **`dedupe_key`** ist Klartext, kein HMAC: `token|type` für Zustände,
  `token|sent|<zeitstempel>` für den wiederholbaren Versand. Die Verschlüsselung
  war nur dafür gedacht, die Adresse aus einem Webhook-Payload nicht im Klartext
  in die Tabelle zu schreiben — der Abgleich liefert den Token, die Adresse kommt
  gar nicht vor. `on conflict (dedupe_key) do nothing` macht den täglichen Lauf
  folgenlos. Nebenwirkung: Eine Rotation von `AUSWERTUNG_SECRET` kann keine alten
  Schlüssel mehr ungültig machen und damit keine Ereignisse verdoppeln.

  Der Unterschied zwischen den beiden Formen trägt die ganze Logik: **Versendet
  ist ein Vorgang**, der sich bei jedem Sequenzschritt wiederholt — deshalb
  gehört der Zeitstempel in den Schlüssel. **Gebounct, abgemeldet und
  geantwortet sind Zustände**; wer gebounct ist, bouncet nicht jeden Tag neu.
  Stünde dort ein Zeitstempel, legte jeder Abgleich eine weitere Zeile an.

Dazu vier denormalisierte Spalten auf `contacts`, damit die Dashboard-Abfragen
nicht um ein weiteres Join-Niveau wachsen:

```sql
alter table contacts
  add column if not exists mail_sent_at    timestamptz,
  add column if not exists mail_bounced_at timestamptz,
  add column if not exists mail_replied_at timestamptz,
  add column if not exists mail_status     text;  -- Instantly-Lead-Status
```

`lead_unsubscribed` setzt zusätzlich `contacts.optout_at` — damit schließt sich
die Lücke, dass `api/track.js:149` auf ein Feld prüft, das nie geschrieben wird.
Ein Abgemeldeter wird danach auf der Website nicht mehr zugeordnet.

### 2. Neuer Endpunkt — `api/instantly.js`

Eine Datei, zwei Betriebsarten, aufgebaut wie `api/auswertung.js` (Router über
`?a=`, `crypto.timingSafeEqual` für Geheimnisvergleiche, `db()` aus
[`api/_db.js`](../api/_db.js)).

**`POST /api/instantly?a=hook`** — der Webhook. **Zurückgestellt**, der
Tarif lässt ihn nicht zu (siehe oben). Der Entwurf gilt unverändert, sobald
Hyper Growth vorliegt.

- Instantly bietet **keine Signatur**, nur selbst gesetzte Header. Auth ist
  deshalb ein Header `x-manereal-hook` gegen `INSTANTLY_WEBHOOK_SECRET`,
  verglichen mit `timingSafeEqual` wie in `api/auswertung.js:55-97`.
- Verarbeitete `event_type`: `email_sent`, `email_bounced`, `lead_unsubscribed`,
  `reply_received`, `lead_interested`. Alles andere wird verworfen.
- **Zuordnung primär über den Token, nicht über die Adresse.** Der Payload
  enthält die Custom Variables des Leads — also unseren `Token`, der in
  Instantly ohnehin für den Link gemappt ist. Fallback: `lead_email` gegen
  `contacts.email`. Der Token-Weg ist eindeutig, auch wenn dieselbe Adresse in
  mehreren Wellen steht.
- Antwort **immer 200** bei gültigem Secret, auch wenn der Kontakt unbekannt
  ist — Instantly deaktiviert Webhooks nach wiederholten Fehlern selbsttätig.
  Nur ein falsches Secret gibt 401.
- Body-Limit und Typ-Whitelist analog `api/track.js:75-96`.

**`GET /api/instantly?a=abgleich`** — der tägliche Nachzieher.

- `POST https://api.instantly.ai/api/v2/leads/list` mit
  `Authorization: Bearer $INSTANTLY_API_KEY`, **ohne Kampagnenfilter**,
  `limit: 100`, Cursor `starting_after`.
- Pro Lead übernommen: `status`, `timestamp_last_contact`, `email_reply_count`,
  `payload.Token` für die Zuordnung. Leads ohne Token werden übersprungen.
- Zugang: entweder `Authorization: Bearer $CRON_SECRET` (Vercel Cron) oder ein
  gültiges `auswertung`-Cookie (Knopf im Dashboard).
- Fasst zusammen, wie viele Kontakte geändert wurden, und schreibt den
  Zeitpunkt des letzten Abgleichs.

Eintrag in [`vercel.json`](../vercel.json): `maxDuration: 30` für
`api/instantly.js`, plus

```json
"crons": [{ "path": "/api/instantly?a=abgleich", "schedule": "0 5 * * *" }]
```

Neue Environment-Variablen: **`INSTANTLY_API_KEY` und `CRON_SECRET`, mehr
nicht.** `CRON_SECRET` ist der einzige Name, der nicht frei wählbar ist —
Vercel sendet den Wert einer so benannten Variablen selbsttätig als
`Authorization`-Header, wenn es den Cron aufruft.

### 3. Dashboard — `api/auswertung.js` und `auswertung.html` *(gebaut)*

Am 28.09.2026 umgesetzt. Drei Dinge kamen im Bauen dazu, die im Plan nicht
standen und ohne die der Umbau in die Irre geführt hätte:

1. **`unbekannt` als eigener Zustand.** Ein Kontakt ohne `mail_status` ist nicht
   *offen* — der Abgleich hat ihn schlicht nie gesehen. Die Spalte *Mail* zeigt
   dafür ein Wort mit gestricheltem Rand statt einer Farbe: Es ist kein
   Ergebnis, sondern dessen Fehlen.
2. **Der Stand des Abgleichs reist mit jeder Ansicht mit**, die Mail-Zahlen
   zeigt — Übersicht, Personen, Detailblatt. Dafür gibt es `abgleichStand()` und
   die Aktion `?a=stand` für die Verwaltung. Ist der Stand älter als anderthalb
   Tage, färbt sich die Zeile: Dann hat der Cron nicht gewartet, dann läuft er
   nicht.
3. **Der Abgleich meldet Leads ohne Token.** Der erste Lauf zeigte 134 Leads,
   davon 67 ohne `Token` — unsichtbar für das Dashboard, ohne dass es jemandem
   aufgefallen wäre. Die Zahl steht jetzt als Warnung unter dem Knopf.

**Trichter** (`uebersicht()`; Darstellung `zeichneUebersicht`). Zwei Stufen vorn
eingesetzt:

```text
in der Datenbank → tatsächlich versendet → zugestellt → Link aufgerufen
→ davon Mensch → zwei Seiten oder mehr → Erstgespräch → Formular
```

„zugestellt" = versendet minus `mail_bounced_at`. „geantwortet", „gebounct" und
„abgemeldet" stehen **neben** dem Trichter, nicht darin — eine Antwort ist kein
Zwischenschritt zum Formular, sondern ein zweiter Weg zum selben Ziel, und eine
Abmeldung ist gar kein Fortschritt.

Die Klickrate rechnet gegen das **Zugestellte**, nicht mehr gegen die Liste;
solange nichts versendet ist, ersatzweise gegen die Datenbank, sonst stünde
dort eine Division durch null. Dieselbe Unterscheidung in der
Kampagnen-Tabelle: Die Spalte hieß *versendet* und meinte *in der Datenbank* —
jetzt stehen beide nebeneinander.

**Personen** (`personen()`; Tabelle in `zeichnePersonen`): neue Spalte **Mail**
mit einem Wort — *unbekannt · offen · versendet · gebounct · abgemeldet ·
geantwortet*. Die Sortierung bleibt unverändert (Lesezeit absteigend,
Nichtaufrufer unten); die Spalte erklärt aber endlich, warum jemand unten steht
— nicht aufgerufen ist etwas anderes als nie zugestellt.

**Detailblatt** (`person()`; `zeichneBlatt`): Mail-Chronik aus `mail_events`
**vor** den Besuchen, in derselben Form wie die bestehende Ereignis-Chronik.
Liegt kein Ereignis vor, steht dort trotzdem ein Satz — *noch nie abgeglichen*,
*noch keine Mail hinaus* oder *Token liegt in Instantly nicht vor* —, weil ein
leerer Kasten die drei Fälle nicht unterscheidet. `contacts.sent_at` aus der
hochgeladenen Datei steht als *geplant für* daneben, getrennt benannt, damit
niemand das Geplante für das Gemessene hält. Das Blatt wird auch aus dem
Traffic-Log heraus geöffnet — es trägt an beiden Einstiegen.

**Verwaltung** (`zeichneVerwaltung`): Knopf „Jetzt abgleichen" plus Zeitpunkt
des letzten Abgleichs. Der Knopf ruft `/api/instantly?a=abgleich` **direkt**
auf, nicht über `/api/auswertung` — `api/instantly.js` prüft dasselbe Cookie mit
derselben Funktion, und der Cron ruft dieselbe Adresse auf. Zwei Wege herein,
ein Weg hindurch. Die Einrichtungsanleitung für den Webhook entfällt, solange
es ihn nicht gibt.

**Export** (`exportieren()`): Spalten `mail_status`, `versendet_am`, `gebounct`,
`geantwortet` und `abgemeldet`, vor den Besuchsspalten — sie liegen zeitlich
davor.

### 4. Webhook in Instantly anlegen — entfällt vorerst

Zurückgestellt bis Hyper Growth. Zwei Korrekturen für den Tag, an dem es
soweit ist:

- **Kein API-Aufruf nötig.** Der Webhook wird in der Oberfläche angelegt:
  Integrations → *Add Webhook* → URL, Events und Kampagne wählen. Unter *Add
  headers* lässt sich `x-manereal-hook` mit dem Secret setzen — „Attach custom
  HTTP headers for authentication or extra context".
- **Der Payload trägt den Token vermutlich nicht.** Dokumentiert sind
  `timestamp`, `campaign_id`, `lead_email`, `step`, `event_type`,
  `workspace`, `email_id`, `email_subject` — von den Custom Variables des
  Leads ist keine Rede. Die Zuordnung läuft dann über `lead_email` **plus**
  `campaign_id`, denn `unique (email, campaign)` erlaubt dieselbe Adresse in
  mehreren Wellen. Der erste echte Webhook wird deshalb einmal im Rohtext
  protokolliert, bevor die Zuordnung darauf gebaut wird.

### 5. Doku

- [TRACKING.md](TRACKING.md): neuer Abschnitt „Was Instantly beisteuert",
  ENV-Tabelle ergänzen, im Abschnitt „Was nicht gemessen werden kann" den Punkt
  *geöffnete Mails* präzisieren — er bleibt bestehen, jetzt aber als
  Entscheidung, nicht als technische Grenze.
- [UMSTELLUNG-INSTANTLY.md](UMSTELLUNG-INSTANTLY.md): die Zeilen 210–220
  beschreiben noch die Kopfzeile `Email,Name,Company,Link`; tatsächlich schreibt
  der Code `Email,Firstname,Lastname,Company,Token`. Wird mitkorrigiert.
- [AENDERUNGEN.md](AENDERUNGEN.md): fortschreiben.

---

## Reihenfolge

1. ✅ `db/schema.sql` erweitern, Migration im Neon-SQL-Editor einspielen
2. ✅ `api/instantly.js` — `?a=abgleich`; `?a=hook` zurückgestellt
3. ✅ `vercel.json`: Function-Eintrag und Cron
4. ✅ Abfragen in `api/auswertung.js`
5. ✅ Darstellung in `auswertung.html`
6. ✅ Abgleich gegen die echte Kampagne ausgelöst — 28.09.2026, 134 Leads,
   67 zugeordnet, 0 Änderungen (es ist noch keine Mail hinaus)
7. ✅ Doku
8. ⬜ **Testmail.** Steht noch aus, weil die Welle noch nicht läuft. Erst sie
   beweist die Kette bis zum Postfach, siehe [testmail-instantly.md](testmail-instantly.md)

---

## Prüfung

### Was am 28.09.2026 geprüft wurde *(erledigt)*

Gegen die echte Neon-Datenbank und die echte Instantly-API, über einen lokalen
Server, der `vercel dev` nachbildet (statische Dateien plus die beiden
Functions):

- Alle sechs Abfragen antworten mit 200: `uebersicht`, `personen`, `person`,
  `seiten`, `verkehr`, `stand` — dazu der CSV-Export mit den neuen Spalten.
- Dashboard im Browser, alle fünf Reiter, **keine Konsolenmeldung**. Bei 390 px
  Breite kein Querscrollen, der Stand-Balken und die drei Nebenzahlen stapeln.
- Spaltenzahl in der Personentabelle stimmt mit den Zeilen überein (9 zu 9) —
  der Fehler, den ein übersehenes `colspan` erzeugt.
- **Abgleich von Hand ausgelöst** und gegen die echte API gelaufen: 134 Leads,
  67 mit Token, 67 zugeordnet, 0 Änderungen, 0 neue Ereignisse. Der zweite Lauf
  ohne Änderung meldet null — der `dedupe_key` trägt.
- Der Stand-Balken zeigte nach dem Lauf den neuen Zeitpunkt.

### Was erst die erste Welle prüfen kann *(offen)*

Kein Kontakt hat bisher eine Mail bekommen; alle 67 stehen auf `offen`, und
`mail_events` ist leer. Diese fünf Dinge sind deshalb **ungeprüft**:

- **Ein `sent`-Ereignis entsteht** und die Stufe „tatsächlich versendet"
  springt. Bis dahin ist der Trichter oben ehrlich leer.
- **Ein Bounce** setzt `mail_bounced_at`: „versendet" 1, „zugestellt" 0.
- **Eine Antwort** setzt `mail_replied_at` und das Wort *geantwortet*.
- **Eine Abmeldung** setzt `contacts.optout_at`; danach wird ein Aufruf mit
  `?m=<Token>` **nicht** mehr zugeordnet (`api/track.js:146-156`). Im Reiter
  **Traffic** muss derselbe Besuch trotzdem als Kampagnenverkehr erscheinen,
  nur ohne Namen — sonst hat die Abmeldung die Kurve rückwirkend verändert.
- **Testmail** an `Julian@pils.cc` nach dem Muster in
  [testmail-instantly.md](testmail-instantly.md): Steht im Quelltext der
  empfangenen Mail die fertige Adresse statt `{{Token}}`, ist die Kette vom
  Editor bis zum Postfach bewiesen und nicht nur bis zur Vorschau.

**Die Kontrolle im laufenden Betrieb bleibt dieselbe:** nach den ersten fünfzig
Mails ins Dashboard sehen. Stehen dort nur anonyme Aufrufe, ist der Code
unterwegs verloren gegangen.

**Auslieferung:** `git push joergen main` — nicht `origin`. Nur das
`joergen`-Remote löst den Redeploy aus. Jeder Push geht damit direkt live, es
gibt keine Vorschau mehr dazwischen.

Ein *Protection Bypass for Automation* ist **nicht** nötig — er war nur für den
Webhook gedacht. Vercels Standard-Schutz deckt Vorschau- und
Deployment-Adressen ab, die aktuelle Produktionsadresse bleibt offen, und der
Cron ruft ohnehin von innen auf.

---

## Was offen bleibt

- **67 von 134 Leads in Instantly tragen keinen `Token`** (Stand 28.09.2026).
  Für sie sammelt der Abgleich nichts, und ihre Klicks wären niemandem
  zuzuordnen. Zu klären ist, ob das ein zweiter Import ohne die Spalte war oder
  eine fremde Kampagne im selben Arbeitsbereich. **Vor der ersten Welle zu
  entscheiden** — nachträglich lässt sich einem bereits angeschriebenen Lead
  kein Token mehr unterschieben, der zu einem Link passt, der schon draußen ist.
- **Der Abgleich läuft über alle Kampagnen des Arbeitsbereichs.** Solange dort
  auch Fremdes liegt, meldet er jedes Mal „n Tokens unbekannt". Das ist richtig
  gezählt, aber es gewöhnt einen an eine Warnung — und eine Warnung, an die man
  sich gewöhnt, wirkt nicht mehr.
- **Geklärt am 28.09.2026:** Der Arbeitsbereich hat Growth, API v2 ist damit
  verfügbar, Webhooks nicht. Der Key braucht nur Lesezugriff — `all:read` oder
  `leads:read`; das Anlegen eines Webhooks geschieht ohnehin in der
  Oberfläche, nicht über die API.
- **Erledigt am 28.09.2026: Der Abgleich braucht überhaupt keine
  Kampagnen-ID.** `leads/list` antwortet auch ohne `campaign`-Filter und gibt
  die Leads aller Kampagnen des Arbeitsbereichs heraus. Weil `contacts.token`
  Primärschlüssel ist, ist der Token über alle Wellen hinweg eindeutig — die
  Zuordnung braucht die Kampagne nicht, und niemand muss pflegen, welche
  Instantly-Kampagne zu welcher Welle gehört. Eine neue Kampagne, drei parallele
  Kampagnen, ein umbenannter Titel, verschobene Leads: nichts davon verlangt
  einen Eingriff.

  Der Preis ist ein Vollabgleich statt eines gefilterten. Bei 100 Leads je Seite
  sind das für den österreichischen Markt — rund 2.000 bis 3.000 Betriebe —
  höchstens 30 Aufrufe. Sollte es je knapp werden, filtert man nachträglich auf
  aktive Kampagnen; dafür jetzt eine Konfiguration einzuführen wäre verkehrt.
- **Vercel Cron** läuft im Hobby-Tarif nur einmal täglich. Für den Nachzieher
  reicht das; wer häufiger abgleichen will, drückt den Knopf im Dashboard.
- **Rechtliches:** es kommt kein Zählpixel und kein Cookie dazu, der Charakter
  der Erhebung ändert sich also nicht. Der Hinweis in [TRACKING.md](TRACKING.md),
  dass Abschnitt 4 der Datenschutzerklärung ein Entwurf ist und rechtlich
  bestätigt gehört, bleibt bestehen — er gilt dann auch für die
  Versandereignisse.

---

## Quellen

- [Webhook-Ereignistypen](https://developer.instantly.ai/webhook-events)
- [Webhook-Einführung](https://developer.instantly.ai/api/v2/webhook)
- [Leads auflisten](https://developer.instantly.ai/api-reference/lead/list-leads)
- [Kampagnen-Auswertung](https://developer.instantly.ai/api/v2/analytics)

-- Schema für das Outreach-Tracking.
--
-- Einspielen im SQL-Editor von Neon oder mit:
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- Bewusst drei schlanke Tabellen. Auswertungen wie "welche Seite hat Person X
-- wie lange gelesen" sind Abfragen darüber, keine gespeicherten Datensätze --
-- so lassen sich auch Fragen beantworten, die heute noch niemand stellt.

-- Empfängerliste des Outreach. Wird aus der Kontaktliste befüllt und als
-- Datei für Instantly wieder ausgegeben.
create table if not exists contacts (
  token      text primary key,     -- 10 Zeichen Crockford-Base32, zufällig
  email      text not null,
  firstname  text,
  lastname   text,
  company    text,
  campaign   text not null,        -- z. B. 'welle-2-wien'; bleibt auf unserer Seite
  sent_at    date,
  -- Alle weiteren Spalten der hochgeladenen Datei, unverändert. Sie werden
  -- nicht ausgewertet, sondern nur durchgereicht, damit in Instantly beliebig
  -- personalisiert werden kann, ohne dass hier etwas anzupassen wäre.
  extra      jsonb,
  optout_at  timestamptz,          -- gesetzt => keine Zuordnung mehr
  created_at timestamptz not null default now(),
  -- Dieselbe Adresse darf in mehreren Wellen stehen, aber nicht zweimal in
  -- derselben. Damit ist ein versehentlich wiederholter Upload harmlos:
  -- er legt nichts doppelt an, statt die Liste zu verdoppeln.
  unique (email, campaign)
);

-- Ein Besuch. Wegen des Hash-Routings der Website deckt ein Seitenaufruf
-- die gesamte Sitzung ab.
create table if not exists visits (
  id         uuid primary key,     -- im Browser erzeugt, nirgends am Gerät gespeichert
  token      text references contacts(token) on delete set null,
  campaign   text,
  source     text,                 -- 'instantly' | Referrer-Host | 'direkt'
  device     text,                 -- 'mobil' | 'desktop'
  country    text,                 -- aus x-vercel-ip-country, die IP wird nie gespeichert
  started_at timestamptz not null default now(),
  human      boolean not null default false,  -- menschliches Signal eingetroffen
  signal     text                  -- welches Signal zuerst kam
);

create table if not exists events (
  id       bigserial primary key,
  visit_id uuid not null references visits(id) on delete cascade,
  ts       timestamptz not null default now(),
  type     text not null,
  route    text,
  dwell_ms integer,                -- nur bei route_leave
  meta     jsonb
);

-- Was mit der Mail selbst geschah, aus Instantly nachgeholt. Das eigene
-- Tracking beginnt erst beim Klick auf den Link -- diese Tabelle deckt die
-- Strecke davor ab: tatsächlich versendet, gebounct, abgemeldet, geantwortet.
--
-- Bewusst ohne E-Mail-Spalte. Der Abgleich löst die Adresse über die Custom
-- Variable "Token" auf und verwirft sie danach; "on delete set null" macht die
-- Ereignisse nach einer DSGVO-Löschung anonym, genau wie bei visits.
create table if not exists mail_events (
  id         bigserial primary key,
  token      text references contacts(token) on delete set null,
  campaign   text,                -- unser Wellenname, nicht Instantlys ID
  type       text not null,       -- sent | bounced | unsubscribed | replied
  ts         timestamptz not null,
  step       int,
  meta       jsonb,
  -- Derselbe Abgleich läuft täglich und sieht dieselben Zustände wieder.
  -- "on conflict do nothing" macht das folgenlos. Der Schlüssel enthält keine
  -- Adresse, nur den Token -- deshalb genügt Klartext ohne HMAC.
  dedupe_key text not null unique
);

create index if not exists events_visit_ts   on events (visit_id, ts);
create index if not exists events_type       on events (type);
create index if not exists visits_token      on visits (token);
create index if not exists visits_campaign   on visits (campaign, started_at);
-- Der Traffic-Reiter fragt nach Tagen über alle Besuche hinweg, ohne
-- Kampagne davor. Der Index oben greift dafür nicht: Sein erster Schlüssel ist
-- campaign, und über alle Kampagnen hinweg ist das kein Bereich mehr.
create index if not exists visits_started_at  on visits (started_at);
create index if not exists contacts_campaign on contacts (campaign);
create index if not exists mail_events_token on mail_events (token, ts);

-- Löschung nach DSGVO: eine Zeile genügt. Durch "on delete set null" fällt
-- der Personenbezug weg, die Verhaltensdaten bleiben anonym in der Statistik.
--   delete from contacts where token = 'K7F3M2QX9P';

-- Nachzug: Vor der Umstellung auf Instantly trug jeder Besuch aus einem
-- Mail-Link die Herkunft 'gmass'. Der Dienst ist abgelöst, der Weg derselbe.
-- Die Zeile ist harmlos, wenn sie ein zweites Mal läuft.
update visits set source = 'instantly' where source = 'gmass';

-- Nachzug: Vier abgeleitete Spalten auf contacts. Sie sind aus mail_events
-- herleitbar, stehen aber hier, damit die Abfragen des Dashboards nicht um ein
-- weiteres Join-Niveau wachsen. Geschrieben werden sie nur vom Abgleich.
alter table contacts
  add column if not exists mail_sent_at    timestamptz,
  add column if not exists mail_bounced_at timestamptz,
  add column if not exists mail_replied_at timestamptz,
  -- Instantly-Lead-Status als Wort: versendet | gebounct | abgemeldet |
  -- geantwortet | offen. Was das Dashboard in der Spalte "Mail" anzeigt.
  add column if not exists mail_status     text;

-- Der Abgleich schreibt "optout_at", sobald Instantly einen Lead als
-- abgemeldet führt. Damit greift die Sperre in api/track.js, die bisher auf
-- ein Feld prüfte, das keine Codestelle beschrieben hat.
--
-- Instantly gibt den Zustand heraus, nicht den Zeitpunkt: optout_at trägt
-- daher den Moment des Abgleichs, der die Abmeldung zuerst gesehen hat -- im
-- Zweifel bis zu einen Tag zu spät. Rückwirkend soll die Sperre ohnehin nichts
-- ändern, die Kurven der Vergangenheit bleiben, wie sie waren.

-- Zeitpunkt des letzten Instantly-Abgleichs. Eine Zeile, ein Wert. Das
-- Dashboard zeigt ihn neben jeder Mail-Angabe an, denn ohne ihn liest man eine
-- leere Zelle als "nicht versendet", obwohl sie "noch nicht abgeglichen" heißt.
create table if not exists sync_state (
  key     text primary key,
  ts      timestamptz,
  meta    jsonb
);

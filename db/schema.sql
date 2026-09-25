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

create index if not exists events_visit_ts   on events (visit_id, ts);
create index if not exists events_type       on events (type);
create index if not exists visits_token      on visits (token);
create index if not exists visits_campaign   on visits (campaign, started_at);
-- Der Verkehrs-Reiter fragt nach Tagen über alle Besuche hinweg, ohne
-- Kampagne davor. Der Index oben greift dafür nicht: Sein erster Schlüssel ist
-- campaign, und über alle Kampagnen hinweg ist das kein Bereich mehr.
create index if not exists visits_started_at  on visits (started_at);
create index if not exists contacts_campaign on contacts (campaign);

-- Löschung nach DSGVO: eine Zeile genügt. Durch "on delete set null" fällt
-- der Personenbezug weg, die Verhaltensdaten bleiben anonym in der Statistik.
--   delete from contacts where token = 'K7F3M2QX9P';

-- Nachzug: Vor der Umstellung auf Instantly trug jeder Besuch aus einem
-- Mail-Link die Herkunft 'gmass'. Der Dienst ist abgelöst, der Weg derselbe.
-- Die Zeile ist harmlos, wenn sie ein zweites Mal läuft.
update visits set source = 'instantly' where source = 'gmass';

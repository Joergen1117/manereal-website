# Manereal Website – Deployment-Anleitung

Diese Seite ist eine einzelne, self-contained `index.html` (alle Bilder als base64 eingebettet,
kein Build-Schritt nötig). Vercel erkennt das automatisch als statische Website.

## 1. Lokales Git-Repository anlegen

Öffne ein Terminal im Ordner `manereal-site/` und führe aus:

```bash
git init
git add .
git commit -m "Initial commit: manereal website"
```

## 2. Repository auf GitHub anlegen

1. Gehe auf [github.com/new](https://github.com/new) und erstelle ein neues, leeres Repository
   (z. B. `manereal-website`) – **ohne** README/gitignore anzuhaken, da die schon lokal existieren.
2. Verknüpfe dein lokales Repo mit GitHub und pushe:

```bash
git remote add origin https://github.com/<dein-username>/manereal-website.git
git branch -M main
git push -u origin main
```

Danach liegt dein Code auf GitHub – das ist die Voraussetzung für Vercel.

## 3. Vercel-Projekt importieren

1. Auf [vercel.com](https://vercel.com) mit deinem GitHub-Account einloggen.
2. „Add New… → Project" → das Repository `manereal-website` auswählen → „Import".
3. Vercel erkennt automatisch „Other/Static" (kein Framework nötig, da nur `index.html`).
   Einfach auf „Deploy" klicken – kein Konfigurationsaufwand nötig.
4. Nach ca. 30 Sekunden ist die Seite unter einer `*.vercel.app`-Adresse live.

## 4. Eigene Domain verknüpfen

1. In Vercel: Project → **Settings → Domains** → „Add" → deine Domain eintragen (z. B. `lorenz.com`).
2. Vercel zeigt dir zwei DNS-Einträge:
   - **A-Record** → zeigt auf die Vercel-IP (für `lorenz.com` ohne `www`)
   - **CNAME-Record** → zeigt auf `cname.vercel-dns.com` (für `www.lorenz.com`)
3. Beim Domain-Registrar (z. B. Namecheap → Domain verwalten → **Advanced DNS**):
   - Bestehende Standard-Einträge (Parking-Page o. ä.) löschen
   - Die A- und CNAME-Records exakt so eintragen, wie Vercel sie anzeigt
4. DNS-Änderungen brauchen zwischen wenigen Minuten und ein paar Stunden, bis sie greifen.
   Vercel zeigt in den Domain-Einstellungen live an, sobald die Verbindung erkannt wurde
   (grünes Häkchen) und stellt automatisch ein SSL-Zertifikat (https) aus.

## Updates nach dem Go-Live

Für jede künftige Änderung an der Seite:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Vercel deployt automatisch bei jedem Push auf `main` – keine weiteren Schritte nötig.

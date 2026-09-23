# Geteilte Assets

Optimierte Dateien, die **allen** Entwürfen zur Verfügung stehen:
Portraits, Objektfotos, Logo, Favicon.

Regeln:
- Nichts aus `../../archive/source-images/` direkt einbinden. Dort liegen 5–17 MB
  Rohdateien. Hier landen nur Ableitungen.
- Zielwerte fürs Web: Hero-Bilder max. 2560 px Breite und unter 400 KB,
  Inhaltsbilder max. 1600 px und unter 200 KB, Portraits max. 1200 px.
  Format WebP oder AVIF, mit JPEG-Fallback nur falls nötig.
- Dateinamen sprechend und englisch, klein, mit Bindestrich:
  `portrait-<nachname>.webp`, `building-<ort>-01.webp`.
- Entwurfsspezifische Assets gehören **nicht** hierher, sondern in
  `designs/NN-name/assets/`.

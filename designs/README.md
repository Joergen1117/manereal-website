# Entwürfe

Ein Unterordner pro Entwurf. Die Ordner sind **abgeschottet**: kein
Entwurf liest oder referenziert einen anderen (siehe
[../CLAUDE.md](../CLAUDE.md), Regel 1).

```
designs/
├─ _template/        Vorlage für einen neuen Entwurf
├─ 01-<name>/        Entwurf 1
├─ 02-<name>/        Entwurf 2
└─ 03-<name>/        Entwurf 3
```

## Aufbau eines Entwurfsordners

| Datei / Ordner | Zweck |
|---|---|
| `CLAUDE.md` | Die Regeln dieses Entwurfs. Wird automatisch geladen, sobald in diesem Ordner gearbeitet wird. Enthält Haltung, Verbote, Referenzen. |
| `DESIGN.md` | Die Design-Tokens: Farbe, Typografie, Raster, Abstände, Motion. Die einzige Quelle für gestalterische Werte dieses Entwurfs. |
| `.claude/skills/` | Optional. Der Stil-Skill, der nur für diesen Entwurf gelten soll — dadurch ist auch das Werkzeug-Wissen entwurfsspezifisch. |
| `index.html` | Die Seite. |
| `assets/` | Nur was dieser Entwurf braucht. Geteiltes liegt in `../../content/assets/`. |

## Neuen Entwurf anlegen

1. `_template/` kopieren nach `NN-<name>/`
2. `CLAUDE.md` und `DESIGN.md` vollständig ausfüllen — beide dürfen keine
   Platzhalter mehr enthalten, bevor die erste Zeile HTML entsteht
3. Falls ein Stil-Skill dazugehört: `.claude/skills/<skill>/` hierher
   verschieben, nicht kopieren, und aus dem Projekt-Root entfernen

## Vergleichbarkeit

Damit die Entwürfe fair vergleichbar bleiben, gilt für alle: derselbe
Wortlaut aus [../content/inhalte.md](../content/inhalte.md), vollständig und
unverändert, sowie kein Build-Schritt. Unterschiedlich ist
ausschließlich die Gestaltung — dazu gehört auch, auf wie viele Seiten
der Inhalt verteilt wird.

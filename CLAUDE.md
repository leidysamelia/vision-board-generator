# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

This is a zero-dependency static web app — no build step, no package manager.

```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or serve with any local HTTP server (needed if you add `fetch` calls or ES modules):

```bash
python3 -m http.server 8080
```

There are no tests, no linter config, and no CI pipeline.

## Architecture

Three files make up the entire app:

- **`index.html`** — three `<div class="screen">` panels (welcome, wizard, board) plus a fullscreen overlay. Only one screen is `.active` at a time; JavaScript swaps them with CSS transitions.
- **`style.css`** — CSS custom properties drive theming (`--accent-a/b`, pastel palette, radii, shadows). The `.screen` / `.screen.active` / `.screen.exiting` classes handle full-viewport transitions.
- **`script.js`** — all application logic, organized into inline modules:

### script.js module layout

| Section | Responsibility |
|---|---|
| `QUESTIONS` array | The 5 wizard steps — drives both the UI and what gets saved |
| `INTENTION_PALETTES` | Maps intention keywords → canvas color palette |
| `PLACE_PATTERNS` | Maps place keywords → background pattern type (`beach`, `mountain`, `city`, `default`) |
| `HABIT_ICONS` | Maps habit keywords → icon shape drawn on canvas |
| `state` object | Single source of truth: `{ step, answers }` |
| `Storage` module | Thin `localStorage` wrapper keyed to `STORAGE_KEY = 'visionboard_2026'` |
| `showScreen(id)` | Transitions between the three screens |
| Wizard module | `initWizard`, `renderQuestion`, `handleNext/Prev` — renders questions one at a time |
| Canvas helpers | `roundRect`, `wrapText`, `getIntentionPalette`, `getPlacePattern`, `getHabitIcon` |
| Canvas draw layers | Each `draw*` function is one composited layer called in order inside `generateBoard()` |
| `generateBoard()` | Orchestrates all canvas draw layers onto `#vision-canvas` (1200×800) |
| Download/Fullscreen | `downloadBoard()` uses `canvas.toDataURL()`; fullscreen copies canvas to `#fullscreen-canvas` |

### Canvas rendering pipeline

`generateBoard()` calls these layers in order — order matters for compositing:

1. `drawBackground` — gradient fill from `INTENTION_PALETTES`
2. `drawBackgroundPattern` — place-specific pattern (waves / mountains / dots / circles)
3. `drawBotanicals` — decorative leaf/branch illustrations in corners
4. `drawCentralGlow` — radial gradient halo behind the center text
5. `drawIntentionPill` — rounded pill badge at top-center
6. `drawCentralSkill` — large bold text (auto-sized to fit width)
7. `drawHabitOrbit` — 6 icons arranged in a circle around the central text
8. `drawPlaceLabel` — italic label at 76% height with decorative lines
9. `drawDivider` — faded horizontal rule near the bottom
10. `drawEnergyFooter` — pill badge at the bottom with the energy word

### Data flow

User answers → `state.answers` → `Storage.save()` (localStorage) → `generateBoard()` reads `state.answers` to select palette/pattern/icons and render canvas.

The `H_CANVAS` global (set inside `generateBoard`) exists so helper functions called from within it can reference canvas height without threading it as a parameter.

## Key conventions

- **Vanilla ES6+, no frameworks, no dependencies.** Keep it that way.
- **Spanish UI copy** — all user-facing strings are in Spanish.
- Color hex strings use 2-character alpha suffixes (e.g. `palette.a + '28'`) for transparency rather than `rgba()`, because palette colors are stored as 6-digit hex.
- Canvas keyword matching normalizes accented characters with `.normalize('NFD').replace(/[̀-ͯ]/g, '')` before comparing — preserve this when adding new keywords.
- `$('id')` is a shorthand for `document.getElementById`; `q('sel')` for `document.querySelector`.

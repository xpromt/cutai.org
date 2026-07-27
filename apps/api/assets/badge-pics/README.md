# Badge pictures

Funny portrait pictures embedded into the large slop badge. One picture is
picked per scan, deterministically, based on the site slug + tier.

## How the pipeline works

1. **You** generate one 5×5 grid image in browser Gemini (prompt below) and
   save it as `apps/api/assets/badge-pics/source-grid.png`.
2. `npm run slice-pics -w @cutai/api` slices the grid into 25 individual
   PNGs in `./{tier}/{variant}.png` (variant 0..4).
3. At badge-render time the route handler picks
   `variant = fnv1a(slug) % 5` and `row = tier index`, loads the matching
   PNG, base64-encodes it, and embeds it into the SVG. Same slug + tier
   always yields the same picture (AGENTS.md determinism rule).

If the PNGs are absent the badge renders without a picture — nothing breaks.

## Grid layout

- 5 rows × 5 columns, each cell a square portrait.
- Row 0 (top) = `certified-human` — a clever, sharp, glowing human.
- Row 1 = `mostly-organic` — a normal human, a bit distracted.
- Row 2 = `suspiciously-smooth` — a half-human / half-robot hybrid.
- Row 3 = `slop-adjacent` — a clunky early chatbot on a CRT.
- Row 4 (bottom) = `grade-a-slop` — a derpy, broken, drooling AI.
- Columns 0..4 = 5 different character variants within the same tier.

Recommended grid size: **2560×2560 px** (512×512 per cell). The slicer
auto-detects the source image dimensions and divides by `--cols` / `--rows`,
so any size works as long as the cells are square and arranged row-major.

## Gemini prompt (paste into browser Gemini)

> Generate a single 2560x2560 pixel image arranged as a 5x5 grid of square
> portrait characters on a plain neutral background, no text, no labels, no
> grid lines. 5 rows, 5 columns, row-major. The rows go from "clever human"
> at the top to "derpy broken AI" at the bottom, increasing AI-ness and
> increasing derpiness/comedic failure downward. The 5 columns are five
> different character designs within the same row's level. Style: clean
> flat cartoon, muted palette, centered bust portrait in each cell, soft
> shading, consistent lighting across all 25 cells.
> Row 1 (top): a sharp, alert, confident clever human, glowing slightly,
> five varied people.
> Row 2: a regular human, a bit distracted or bored, five varied people.
> Row 3: a half-human half-robot hybrid, uncanny and smooth, five variants.
> Row 4: a clunky early chatbot on an old CRT monitor, five variants.
> Row 5 (bottom): a derpy, broken, drooling AI mascot, comedic failure,
> five variants. Keep each cell self-contained and evenly spaced.

Save the result as `source-grid.png` in this folder, then run
`npm run slice-pics -w @cutai/api`.

## Slicer options

```
node scripts/slice-badge-pics.mjs --src ./assets/badge-pics/source-grid.png \
  --out ./assets/badge-pics --cols 5 --rows 5
```

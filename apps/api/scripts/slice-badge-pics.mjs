#!/usr/bin/env node
// Slice a 5x5 badge-picture grid into 25 individual PNGs.
// See apps/api/assets/badge-pics/README.md for the grid spec and the
// Gemini prompt used to produce the source grid.
//
// Usage:
//   node scripts/slice-badge-pics.mjs \
//     --src ./assets/badge-pics/source-grid.png \
//     --out ./assets/badge-pics \
//     --cols 5 --rows 5
//
// Output: {out}/{tier}/{variant}.png  (variant 0..cols-1, row 0..rows-1)
// Row 0 maps to the "best" tier (certified-human), row N-1 to the "worst".

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Row index -> tier id. Row 0 = clever human (best), row 4 = derpy AI (worst).
const TIER_ROWS = [
  'certified-human',
  'mostly-organic',
  'suspiciously-smooth',
  'slop-adjacent',
  'grade-a-slop',
];

function parseArgs(argv) {
  const args = { cols: 5, rows: 5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--src') args.src = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--cols') args.cols = parseInt(argv[++i], 10);
    else if (a === '--rows') args.rows = parseInt(argv[++i], 10);
    else if (a === '-h' || a === '--help') {
      console.log('Usage: slice-badge-pics.mjs --src <grid.png> --out <dir> --cols 5 --rows 5');
      process.exit(0);
    }
  }
  if (!args.src) {
    // Default source location so `npm run slice-pics` works with no args.
    args.src = join(__dirname, '..', 'assets', 'badge-pics', 'source-grid.png');
  }
  if (!args.out) {
    args.out = join(__dirname, '..', 'assets', 'badge-pics');
  }
  args.src = resolve(args.src);
  args.out = resolve(args.out);
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.src)) {
    console.error(`Source grid not found: ${args.src}`);
    console.error('Generate it in browser Gemini (see assets/badge-pics/README.md)');
    console.error('and save it as source-grid.png, then re-run this script.');
    process.exit(1);
  }

  if (args.rows > TIER_ROWS.length) {
    console.error(`--rows ${args.rows} exceeds known tiers (${TIER_ROWS.length}).`);
    process.exit(1);
  }

  const meta = await sharp(args.src).metadata();
  const gridW = meta.width;
  const gridH = meta.height;
  const cellW = Math.floor(gridW / args.cols);
  const cellH = Math.floor(gridH / args.rows);

  if (cellW < 64 || cellH < 64) {
    console.error(`Cells too small (${cellW}x${cellH}) from a ${gridW}x${gridH} grid.`);
    process.exit(1);
  }
  if (Math.abs(cellW - cellH) > 4) {
    console.warn(`Warning: cells are not square (${cellW}x${cellH}). Badges expect square cells.`);
  }

  console.log(`Slicing ${gridW}x${gridH} grid into ${args.cols}x${args.rows} = ${args.cols * args.rows} cells of ${cellW}x${cellH}`);

  let written = 0;
  for (let row = 0; row < args.rows; row++) {
    const tier = TIER_ROWS[row];
    const tierDir = join(args.out, tier);
    await mkdir(tierDir, { recursive: true });
    for (let col = 0; col < args.cols; col++) {
      const left = col * cellW;
      const top = row * cellH;
      const outPath = join(tierDir, `${col}.png`);
      const buf = await sharp(args.src)
        .extract({ left, top, width: cellW, height: cellH })
        .png()
        .toBuffer();
      await writeFile(outPath, buf);
      written++;
      console.log(`  row ${row} (${tier}) col ${col} -> ${outPath}`);
    }
  }

  console.log(`Done. ${written} PNGs written to ${args.out}`);
}

main().catch(err => {
  console.error('Slice failed:', err);
  process.exit(1);
});

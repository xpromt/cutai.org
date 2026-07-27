import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Badge picture picker.
 *
 * One picture per (tier, variant) where variant is derived deterministically
 * from the site slug. Pictures are pre-sliced from a single Gemini-generated
 * grid (see apps/api/assets/badge-pics/README.md) and stored as static PNGs.
 *
 * The renderer receives the picked picture as a base64 data URL via
 * `BadgeRenderInput.picDataUrl`, so the SVG renderer itself stays pure and
 * testable (no file I/O inside renderSvg). All asset loading lives here.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = join(__dirname, '..', '..', '..', 'assets', 'badge-pics');

/** Number of variants per tier (columns in the source grid). */
export const VARIANTS_PER_TIER = 5;

/**
 * Tier -> grid row. Row 0 = clever human (best, certified-human),
 * row 4 = derpy AI (worst, grade-a-slop).
 */
export const TIER_PIC_ROW: Record<string, number> = {
  'certified-human': 0,
  'mostly-organic': 1,
  'suspiciously-smooth': 2,
  'slop-adjacent': 3,
  'grade-a-slop': 4,
};

// Mirror of packages/slop-rules/src/fnv1a.ts — kept local to avoid coupling
// the badge renderer to the slop-rules package build output. Same algorithm,
// same constants, so seeds are stable across the codebase.
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministically pick a variant index (0..VARIANTS_PER_TIER-1) from a seed
 * string (the site slug). Same slug always yields the same variant.
 */
export function pickVariant(seedText: string): number {
  return fnv1a(seedText) % VARIANTS_PER_TIER;
}

const cache = new Map<string, string | null>();

/**
 * Load the PNG for a given tier + variant and return it as a base64 data URL.
 * Returns null if the asset is missing (e.g. the grid hasn't been generated
 * yet) so callers can gracefully render a badge without a picture.
 *
 * Results are memoized — the same (tier, variant) is read from disk once.
 */
export function loadBadgePicDataUrl(tier: string, variant: number): string | null {
  const key = `${tier}:${variant}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const row = TIER_PIC_ROW[tier];
  if (row === undefined) {
    cache.set(key, null);
    return null;
  }

  const file = join(ASSET_DIR, tier, `${variant}.png`);
  if (!existsSync(file)) {
    cache.set(key, null);
    return null;
  }

  const bytes = readFileSync(file);
  const dataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
  cache.set(key, dataUrl);
  return dataUrl;
}

/**
 * Convenience: pick + load in one call. Returns a data URL or null.
 */
export function getBadgePicForSlug(tier: string, slug: string): string | null {
  const variant = pickVariant(slug);
  return loadBadgePicDataUrl(tier, variant);
}

/** Test-only: clear the in-memory cache. */
export function _clearBadgePicCacheForTests(): void {
  cache.clear();
}

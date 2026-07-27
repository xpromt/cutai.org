import { describe, it, expect } from 'vitest';
import { renderSvg } from '../src/services/badge/badgeService.js';
import { pickVariant, loadBadgePicDataUrl, _clearBadgePicCacheForTests } from '../src/services/badge/badgePics.js';

const FAKE_PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0CAAAAASUVORK5CYII=';

describe('Badge Rendering', () => {
  it('renders a small badge without breakdown', () => {
    const svg = renderSvg({
      score: 15,
      tier: 'mostly-organic',
      roast: 'Mostly written by a human with occasional buzzwords.',
      theme: 'slop-detector',
      size: 'sm',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('MOSTLY ORGANIC');
    expect(svg).toContain('15');
    expect(svg).toContain('cutai.org');
  });

  it('renders a large badge with top slop criteria breakdown', () => {
    const svg = renderSvg({
      score: 42,
      tier: 'slop-adjacent',
      roast: 'Heavy AI presence detected.',
      theme: 'slop-detector',
      size: 'lg',
      wordCount: 1250,
      breakdown: [
        { ruleId: 'buzzword-density', label: 'Buzzword density', points: 20, count: 8 },
        { ruleId: 'ai-openers', label: 'AI opener clichés', points: 15, count: 2 },
        { ruleId: 'not-x-but-y', label: '"Not X, but Y" constructions', points: 7, count: 3 },
      ],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('SLOP ADJACENT');
    expect(svg).toContain('42');
    expect(svg).toContain('TOP DETECTED SLOP SIGNALS');
    expect(svg).toContain('Buzzword density');
    expect(svg).toContain('words analyzed');
    expect(svg).toContain('1,250 words analyzed');
  });

  it('renders certified slop-free banner when score is 0 and no breakdown', () => {
    const svg = renderSvg({
      score: 0,
      tier: 'certified-human',
      roast: 'Pure organic prose.',
      theme: 'clean',
      size: 'lg',
    });

    expect(svg).toContain('CERTIFIED SLOP-FREE CONTENT');
    expect(svg).toContain('CERTIFIED HUMAN');
  });

  it('embeds the funny portrait in the large badge when picDataUrl is provided', () => {
    const svg = renderSvg({
      score: 88,
      tier: 'grade-a-slop',
      roast: 'Derpy AI vibes.',
      theme: 'slop-detector',
      size: 'lg',
      picDataUrl: FAKE_PNG_DATA_URL,
    });

    expect(svg).toContain('Funny Tier Portrait');
    expect(svg).toContain(`href="${FAKE_PNG_DATA_URL}"`);
    expect(svg).toContain('clip-path="url(#portraitClip)"');
  });

  it('omits the portrait when picDataUrl is absent', () => {
    const svg = renderSvg({
      score: 88,
      tier: 'grade-a-slop',
      roast: 'Derpy AI vibes.',
      theme: 'slop-detector',
      size: 'lg',
    });

    expect(svg).not.toContain('Funny Tier Portrait');
    expect(svg).not.toContain('portraitClip');
  });

  it('never renders a portrait on the small badge even if picDataUrl is set', () => {
    const svg = renderSvg({
      score: 88,
      tier: 'grade-a-slop',
      roast: 'Derpy AI vibes.',
      theme: 'slop-detector',
      size: 'sm',
      picDataUrl: FAKE_PNG_DATA_URL,
    });

    expect(svg).not.toContain('Funny Tier Portrait');
    expect(svg).not.toContain('portraitClip');
    // small badge keeps its own structure
    expect(svg).toContain('width="340" height="92"');
    expect(svg).toContain('GRADE A SLOP');
  });
});

describe('Badge picture determinism', () => {
  it('pickVariant is deterministic for the same slug', () => {
    expect(pickVariant('example.com')).toBe(pickVariant('example.com'));
  });

  it('pickVariant stays within 0..VARIANTS_PER_TIER-1', () => {
    for (const slug of ['a', 'example.com', 'some-long-slug-here', 'x'.repeat(200)]) {
      const v = pickVariant(slug);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
    }
  });

  it('different slugs can map to different variants (sanity)', () => {
    const variants = new Set<number>();
    for (let i = 0; i < 50; i++) variants.add(pickVariant(`site-${i}.example.com`));
    expect(variants.size).toBeGreaterThan(1);
  });

  it('loadBadgePicDataUrl returns null gracefully when a file is missing', () => {
    _clearBadgePicCacheForTests();
    // Variant 99 will never exist (grid only has 5 columns), so this must
    // not throw — it returns null so the badge renders without a picture.
    const result = loadBadgePicDataUrl('grade-a-slop', 99);
    expect(result).toBeNull();
  });

  it('loadBadgePicDataUrl returns null for an unknown tier', () => {
    const result = loadBadgePicDataUrl('not-a-real-tier', 0);
    expect(result).toBeNull();
  });
});

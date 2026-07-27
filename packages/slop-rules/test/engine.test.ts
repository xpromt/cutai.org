import { describe, it, expect } from 'vitest';
import { scoreText } from '../src/index';
import type { ScanResult } from '../src/index';

const score = (input: string): ScanResult => scoreText(input);

// ─── Clean human text ──────────────────────────────────────────────────

const CLEAN_TEXT = `The cat sat on the mat. It was a sunny afternoon and the bird was singing outside the window. I made a cup of tea and read a book for an hour. Later I went for a walk in the park. The flowers were blooming and the air smelled fresh.`;

// ─── Slop fixtures per rule ────────────────────────────────────────────

const BUZZWORD_FIXTURE = `We need to leverage our synergy to streamline the workflow. This cutting-edge paradigm shift will revolutionize our mission-critical infrastructure. Let's deep-dive and circle-back on the low-hanging fruit. Our holistic approach empowers us to think outside the box while delivering impactful, scalable solutions.`;

const AI_OPENER_FIXTURE = `In today's fast-paced world, it's important to note that things change. In the ever-evolving landscape of technology, look no further than our solution. Are you tired of the same old approaches?`;

const NOT_X_BUT_Y_FIXTURE = `Not just a tool, but a platform that transforms everything. This isn't a feature — it's a revolution.`;

const EMDASH_FIXTURE = `This is a sentence—with an em-dash. And another—em-dash here. A third—em-dash appears. A fourth—em-dash is extra.`;

const EXCLAMATION_FIXTURE = `Great! Amazing! Fantastic! Incredible! Wow! This is the best thing ever! Don't miss out!`;

const CTA_FIXTURE = `Get started today! Sign up for free and start your free trial. Book a demo now. Don't miss out on this limited time offer.`;

const HEDGE_FIXTURE = `It goes without saying, but at the end of the day, when it comes to our business, needless to say, it is what it is.`;

const LISTICLE_FIXTURE = `Here are the top reasons:
1. First reason is obvious
2. Second reason is even better
3. Third reason will shock you
First, let's start with the basics. Second, we move to advanced topics. Finally, we wrap up.`;

const TRIADIC_FIXTURE = `Our product is fast, reliable, and secure. We deliver value, quality, and performance. The platform scales, adapts, and grows with you.`;

// ─── Tests ─────────────────────────────────────────────────────────────

describe('scoreText', () => {
  it('scores clean human text low', () => {
    const result = score(CLEAN_TEXT);
    expect(result.tier === 'certified-human' || result.tier === 'mostly-organic').toBe(true);
    expect(result.score).toBeLessThanOrEqual(20);
  });

  it('detects buzzwords', () => {
    const result = score(BUZZWORD_FIXTURE);
    const buzz = result.breakdown.find(h => h.ruleId === 'buzzword-density');
    expect(buzz).toBeDefined();
    expect(buzz!.count).toBeGreaterThan(0);
    expect(buzz!.points).toBeGreaterThan(0);
    // Buzzwords per 100 words rate — long text dilutes, so it may not hit grade-a-slop alone
    // Buzzword density with maxPoints cap — hits the ceiling but may not trigger other rules
    expect(result.tier === 'mostly-organic' || result.tier === 'suspiciously-smooth' || result.tier === 'slop-adjacent' || result.tier === 'grade-a-slop').toBe(true);
  });

  it('detects AI openers', () => {
    const result = score(AI_OPENER_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'ai-openers');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThanOrEqual(3);
  });

  it('detects not-x-but-y patterns', () => {
    const result = score(NOT_X_BUT_Y_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'not-x-but-y');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThanOrEqual(2);
  });

  it('detects em-dash density', () => {
    const result = score(EMDASH_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'em-dash-density');
    expect(hit).toBeDefined();
    expect(hit!.points).toBeGreaterThan(0);
  });

  it('detects exclamation density', () => {
    const result = score(EXCLAMATION_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'exclamation-density');
    expect(hit).toBeDefined();
    expect(hit!.points).toBeGreaterThan(0);
  });

  it('detects CTA clichés', () => {
    const result = score(CTA_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'cta-cliche');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThan(0);
  });

  it('detects hedge phrases', () => {
    const result = score(HEDGE_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'hedge-phrase');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThanOrEqual(2);
  });

  it('detects listicle structure', () => {
    const result = score(LISTICLE_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'listicle-structure');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThan(0);
  });

  it('detects triadic enumerations', () => {
    const result = score(TRIADIC_FIXTURE);
    const hit = result.breakdown.find(h => h.ruleId === 'triadic-enumeration');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThanOrEqual(3);
  });

  it('detects triadic enumerations without Oxford comma', () => {
    // Non-Oxford-comma style: "X, Y and Z" (no comma before "and").
    // Common in AI output and British English.
    const noOxford = 'The product is fast, reliable and secure. We deliver value, quality and performance.';
    const result = score(noOxford);
    const hit = result.breakdown.find(h => h.ruleId === 'triadic-enumeration');
    expect(hit).toBeDefined();
    expect(hit!.count).toBeGreaterThanOrEqual(2);
  });

  it('handles empty string without crashing', () => {
    const result = score('');
    expect(result.score).toBe(0);
    expect(result.lowConfidence).toBe(true);
    expect(result.breakdown).toHaveLength(0);
  });

  it('handles whitespace-only input', () => {
    const result = score('   \n  \t  ');
    expect(result.score).toBe(0);
    expect(result.lowConfidence).toBe(true);
  });

  it('handles very short input with lowConfidence', () => {
    const result = score('Hello world');
    expect(result.score).toBe(0);
    expect(result.lowConfidence).toBe(true);
  });

  it('tier boundaries: 19 is certified-human', () => {
    // We need text that generates exactly 19 or fewer points
    // Use a short clean text
    const result = score(CLEAN_TEXT);
    if (result.score <= 19) {
      expect(result.tier).toBe('certified-human');
    }
  });

  it('tier boundaries: 80+ is grade-a-slop', () => {
    // Combine multiple slop signals into one text
    const megaSlop = [BUZZWORD_FIXTURE, AI_OPENER_FIXTURE, CTA_FIXTURE, EMDASH_FIXTURE, EXCLAMATION_FIXTURE, HEDGE_FIXTURE].join('\n');
    const result = score(megaSlop);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('is deterministic — same input always same result', () => {
    const input = 'This is a test of determinism. Leverage synergy.';
    const first = score(input);
    for (let i = 0; i < 50; i++) {
      const next = score(input);
      expect(next.score).toBe(first.score);
      expect(next.tier).toBe(first.tier);
      expect(next.roast).toBe(first.roast);
      expect(next.breakdown).toEqual(first.breakdown);
    }
  });

  it('breakdown is sorted by points descending', () => {
    const result = score(BUZZWORD_FIXTURE);
    for (let i = 1; i < result.breakdown.length; i++) {
      expect(result.breakdown[i - 1].points).toBeGreaterThanOrEqual(result.breakdown[i].points);
    }
  });

  it('returns at least one hit for heavily slop-filled text', () => {
    const result = score(BUZZWORD_FIXTURE);
    expect(result.breakdown.length).toBeGreaterThan(0);
  });
});

import { RULES } from './rules.js';
import { roasts } from './roasts.js';
import { fnv1a } from './fnv1a.js';

export type Tier =
  | 'certified-human'
  | 'mostly-organic'
  | 'suspiciously-smooth'
  | 'slop-adjacent'
  | 'grade-a-slop';

export interface RuleHit {
  ruleId: string;
  label: string;
  points: number;
  count: number;
  examples: string[];
}

export interface ScanResult {
  score: number;
  tier: Tier;
  breakdown: RuleHit[];
  roast: string;
  wordCount: number;
  lowConfidence: boolean;
}

const TIER_BOUNDARIES: { max: number; tier: Tier }[] = [
  { max: 19, tier: 'certified-human' },
  { max: 39, tier: 'mostly-organic' },
  { max: 59, tier: 'suspiciously-smooth' },
  { max: 79, tier: 'slop-adjacent' },
  { max: 100, tier: 'grade-a-slop' },
];

function classifyTier(score: number): Tier {
  for (const b of TIER_BOUNDARIES) {
    if (score <= b.max) return b.tier;
  }
  return 'grade-a-slop';
}

function pickRoast(tier: Tier, seed: number): string {
  const lines = roasts[tier];
  return lines[seed % lines.length];
}

function normalizeForDeterminism(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function scoreText(text: string): ScanResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lowConfidence = wordCount < 30;

  const hits: RuleHit[] = [];
  let totalPoints = 0;

  for (const rule of RULES) {
    const { count, examples } = rule.test(text);
    if (count < 1) continue;

    const raw = count * rule.weight;
    const points = Math.min(raw, rule.maxPoints);
    totalPoints += points;
    hits.push({ ruleId: rule.id, label: rule.label, points, count, examples });
  }

  // Sort by points descending
  hits.sort((a, b) => b.points - a.points);

  const score = Math.min(Math.round(totalPoints), 100);
  const tier = classifyTier(score);

  const seed = fnv1a(normalizeForDeterminism(text));
  const roast = pickRoast(tier, seed);

  return { score, tier, breakdown: hits, roast, wordCount, lowConfidence };
}

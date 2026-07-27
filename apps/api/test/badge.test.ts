import { describe, it, expect } from 'vitest';
import { renderSvg } from '../src/services/badge/badgeService.js';

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
    expect(svg).toContain('250 words analyzed');
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
});

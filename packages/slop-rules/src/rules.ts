export interface RuleDef {
  id: string;
  label: string;
  weight: number;       // multiplies count-based points
  maxPoints: number;    // cap per rule
}

/**
 * A rule that's matched against text.
 * `test` returns the number of occurrences and up to 3 example snippets.
 */
export interface CompiledRule extends RuleDef {
  test(text: string): { count: number; examples: string[] };
}

// ─── Helpers ───────────────────────────────────────────────────────────

function countMatches(text: string, patterns: RegExp[]): { count: number; examples: string[] } {
  let count = 0;
  const examples: string[] = [];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      count++;
      if (examples.length < 3) {
        const match = m[0].trim();
        examples.push(match.length > 60 ? match.slice(0, 57) + '…' : match);
      }
      // Avoid infinite loops on zero-length matches
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return { count, examples };
}

/** Case-insensitive whole-word match for a list of terms. */
function wordPatterns(words: string[]): RegExp[] {
  // \b-word boundary works for ASCII words; good enough for buzzword detection
  return words.map(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'gi'));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Buzzword list ──────────────────────────────────────────────────────

const BUZZWORDS = [
  'delve', 'tapestry', 'landscape', 'unleash', 'elevate', 'streamline',
  'revolutionize', 'cutting-edge', 'game-changer', 'seamless', 'robust',
  'leverage', 'synergy', 'harness', 'embark', 'realm', 'testament',
  'vibrant', 'crucial', 'pivotal', 'innovative', 'empower', 'disrupt',
  'paradigm', 'next-generation', 'mission-critical', 'best-in-class',
  'deep-dive', 'drill-down', 'circle-back', 'touch-base', 'move-the-needle',
  'low-hanging-fruit', 'boil-the-ocean', 'think-outside-the-box',
  'reinvent-the-wheel', 'bleeding-edge', 'transformative',
  'scalable', 'holistic', 'actionable', 'impactful',
];

// ─── Phrase patterns ────────────────────────────────────────────────────

const AI_OPENERS = [
  /in today['’]s fast[- ]?paced world/gi,
  /in the ever[- ]?evolving landscape of/gi,
  /it['’]s important to note/gi,
  /look no further/gi,
  /are you tired of/gi,
  /in an era of/gi,
  /in this digital age/gi,
];

const NOT_X_BUT_Y = [
  /\bnot (?:just )?(\w+(?:\s+\w+)?),? but (\w+(?:\s+\w+)?)/gi,
  /\bisn['’]t (\w+(?:\s+\w+)?) [-–—] it['’]s (\w+(?:\s+\w+)?)/gi,
];

const HEDGE_PHRASES = [
  /it goes without saying/gi,
  /at the end of the day/gi,
  /when it comes to/gi,
  /in my humble opinion/gi,
  /to be honest/gi,
  /with all due respect/gi,
  /needless to say/gi,
  /it is what it is/gi,
];

const CTA_CLICHES = [
  /get started today/gi,
  /try it now/gi,
  /join thousands of/gi,
  /sign up for free/gi,
  /start your free trial/gi,
  /book a demo/gi,
  /schedule a call/gi,
  /unlock (your|the) (full )?potential/gi,
  /don['’]t miss out/gi,
  /limited time offer/gi,
];

const SUPERLATIVE_ADJECTIVES = [
  'best', 'greatest', 'amazing', 'incredible', 'unbelievable',
  'extraordinary', 'remarkable', 'outstanding', 'fantastic',
  'phenomenal', 'revolutionary', 'unprecedented', 'groundbreaking',
  'world-class', 'industry-leading',
];

// ─── Rules ──────────────────────────────────────────────────────────────

/**
 * Baseline per-100-words rate for density rules.
 */
function per100(n: number, wordCount: number): number {
  if (wordCount < 1) return 0;
  return (n / wordCount) * 100;
}

export const RULES: CompiledRule[] = [
  {
    id: 'buzzword-density',
    label: 'Buzzword density',
    weight: 2,
    maxPoints: 25,
    test(text) {
      const words = text.split(/\s+/).filter(Boolean).length;
      const { count, examples } = countMatches(text, wordPatterns(BUZZWORDS));
      // Score based on buzzwords per 100 words
      const rate = per100(count, words);
      return { count: Math.round(rate), examples };
    },
  },
  {
    id: 'ai-openers',
    label: 'AI opener clichés',
    weight: 3,
    maxPoints: 15,
    test(text) {
      return countMatches(text, AI_OPENERS);
    },
  },
  {
    id: 'not-x-but-y',
    label: '"Not X, but Y" constructions',
    weight: 2,
    maxPoints: 10,
    test(text) {
      return countMatches(text, NOT_X_BUT_Y);
    },
  },
  {
    id: 'em-dash-density',
    label: 'Em-dash density',
    weight: 1,
    maxPoints: 10,
    test(text) {
      const words = text.split(/\s+/).filter(Boolean).length;
      const count = (text.match(/[–—]/g) || []).length;
      const rate = per100(count, words);
      // Only score if rate > 1.5 per 100 words (threshold)
      return rate > 1.5 ? { count: Math.round(rate), examples: ['em-dash ×' + count] } : { count: 0, examples: [] };
    },
  },
  {
    id: 'exclamation-density',
    label: 'Exclamation density',
    weight: 1,
    maxPoints: 8,
    test(text) {
      const words = text.split(/\s+/).filter(Boolean).length;
      const count = (text.match(/!/g) || []).length;
      const rate = per100(count, words);
      return rate > 1.5 ? { count: Math.round(rate), examples: ['! ×' + count] } : { count: 0, examples: [] };
    },
  },
  {
    id: 'hedge-phrase',
    label: 'Hedge phrases',
    weight: 2,
    maxPoints: 10,
    test(text) {
      return countMatches(text, HEDGE_PHRASES);
    },
  },
  {
    id: 'superlative-stacking',
    label: 'Superlative stacking',
    weight: 2,
    maxPoints: 12,
    test(text) {
      // Split into sentences, count superlatives per sentence
      const wordRe = new RegExp(`\\b(${SUPERLATIVE_ADJECTIVES.join('|')})\\b`, 'gi');
      const sentences = text.split(/[.?!]+\s*/);
      let count = 0;
      const examples: string[] = [];
      for (const sentence of sentences) {
        const matches = sentence.match(wordRe);
        if (matches && matches.length >= 3) {
          count++;
          if (examples.length < 3) {
            const s = sentence.trim();
            examples.push(s.length > 60 ? s.slice(0, 57) + '…' : s);
          }
        }
      }
      return { count, examples };
    },
  },
  {
    id: 'cta-cliche',
    label: 'CTA clichés',
    weight: 2,
    maxPoints: 10,
    test(text) {
      return countMatches(text, CTA_CLICHES);
    },
  },
  {
    id: 'listicle-structure',
    label: 'Listicle structure',
    weight: 3,
    maxPoints: 12,
    test(text) {
      const lines = text.split('\n').filter(Boolean);
      let count = 0;
      const examples: string[] = [];
      // Count lines starting with a digit+period, bullet, or dash
      for (let i = 0; i < lines.length - 2; i++) {
        const isListItem = (l: string) => /^\s*(?:\d+[.)]|[-*•]|(?:first|second|third|next|finally)[,:])/i.test(l.trimStart());
        if (isListItem(lines[i]) && isListItem(lines[i + 1]) && isListItem(lines[i + 2])) {
          count++;
          if (examples.length < 3) {
            examples.push(lines[i].trim().slice(0, 50));
          }
          i += 2; // skip ahead
        }
      }
      return { count, examples };
    },
  },
  {
    id: 'triadic-enumeration',
    label: 'Triadic enumerations',
    weight: 2,
    maxPoints: 10,
    test(text) {
      // Pattern: "X, Y, and/or Z" — single word items to avoid backtracking
      const re = /\b\w+(?:,\s+\w+){1,3},\s+(?:and|or)\s+\w+\b/gi;
      let count = 0;
      const examples: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        count++;
        if (examples.length < 3) {
          const s = m[0].trim();
          examples.push(s.length > 60 ? s.slice(0, 57) + '…' : s);
        }
      }
      return { count, examples };
    },
  },
];

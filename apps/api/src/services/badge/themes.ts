export interface BadgeTheme {
  bgColor: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  borderColor: string;
  cardBg: string;
  scoreColors: Record<string, string>; // tier → hex color
  fontFamily: string;
}

const SCORE_COLORS: Record<string, string> = {
  'certified-human': '#22c55e',     // green-500
  'mostly-organic': '#84cc16',      // lime-500
  'suspiciously-smooth': '#eab308',  // yellow-500
  'slop-adjacent': '#f97316',       // orange-500
  'grade-a-slop': '#ef4444',        // red-500
};

export const themes: Record<string, BadgeTheme> = {
  'slop-detector': {
    bgColor: '#0f0f13',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    accentColor: '#c084fc',
    borderColor: '#27272a',
    cardBg: '#18181b',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    scoreColors: SCORE_COLORS,
  },
  clean: {
    bgColor: '#ffffff',
    textColor: '#0f172a',
    subtextColor: '#64748b',
    accentColor: '#2563eb',
    borderColor: '#e2e8f0',
    cardBg: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    scoreColors: SCORE_COLORS,
  },
  brutal: {
    bgColor: '#050505',
    textColor: '#ffffff',
    subtextColor: '#a1a1aa',
    accentColor: '#ff0033',
    borderColor: '#3f3f46',
    cardBg: '#121214',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    scoreColors: SCORE_COLORS,
  },
};

export const DEFAULT_THEME = 'slop-detector';
export type BadgeSize = 'sm' | 'lg';

export interface RuleHitInput {
  ruleId: string;
  label: string;
  points: number;
  count: number;
}

export interface BadgeRenderInput {
  score: number;
  tier: string;
  roast: string;
  theme: string;
  size: BadgeSize;
  breakdown?: RuleHitInput[];
  wordCount?: number | null;
  /**
   * Optional base64 data URL of a funny portrait picture picked for this
   * scan (see services/badge/badgePics.ts). When provided, the large badge
   * embeds it as a framed portrait on the left. Omit / null to render
   * without a picture. Small badges never render a picture (no room).
   */
  picDataUrl?: string | null;
}


import { themes, DEFAULT_THEME } from './themes.js';
import type { BadgeRenderInput, BadgeTheme, RuleHitInput } from './themes.js';

export function renderBadgeSvgDirect(input: BadgeRenderInput): string {
  const theme = themes[input.theme] ?? themes[DEFAULT_THEME];
  const tierColor = theme.scoreColors[input.tier] ?? '#a1a1aa';
  const isSmall = input.size === 'sm';

  if (isSmall) {
    return renderSmallBadge(input, theme, tierColor);
  }
  return renderLargeBadge(input, theme, tierColor);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + '…';
}

/** Get top 3 triggered rules sorted by points descending. */
function getTopRules(breakdown?: RuleHitInput[]): RuleHitInput[] {
  if (!breakdown || breakdown.length === 0) return [];
  return [...breakdown].sort((a, b) => b.points - a.points).slice(0, 3);
}

function renderSmallBadge(input: BadgeRenderInput, theme: BadgeTheme, tierColor: string): string {
  const tierLabel = input.tier.replace(/-/g, ' ').toUpperCase();
  const { score, roast } = input;
  const topRules = getTopRules(input.breakdown);
  const topSignalText = topRules.length > 0 
    ? `${topRules[0].label} (+${topRules[0].points})`
    : truncate(roast, 45);

  // Circle gauge math (r=24, perimeter ≈ 150.8)
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="92" viewBox="0 0 340 92">
  <defs>
    <linearGradient id="smBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeXml(theme.bgColor)}" />
      <stop offset="100%" stop-color="${escapeXml(theme.cardBg)}" />
    </linearGradient>
    <filter id="smGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${escapeXml(tierColor)}" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Card Frame -->
  <rect width="340" height="92" rx="12" fill="url(#smBgGradient)" stroke="${escapeXml(theme.borderColor)}" stroke-width="1.5" />

  <!-- Score Circle Gauge -->
  <g transform="translate(46, 46)">
    <!-- Track -->
    <circle r="${radius}" fill="none" stroke="${escapeXml(theme.borderColor)}" stroke-width="4" opacity="0.6" />
    <!-- Progress Arc -->
    <circle r="${radius}" fill="none" stroke="${escapeXml(tierColor)}" stroke-width="4"
      stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${dashOffset.toFixed(1)}"
      stroke-linecap="round" transform="rotate(-90)" filter="url(#smGlow)" />
    <!-- Center Score -->
    <text y="6" text-anchor="middle" fill="${escapeXml(theme.textColor)}" font-size="20" font-weight="800" font-family="${escapeXml(theme.fontFamily)}">${score}</text>
  </g>

  <!-- Header / Tier Label -->
  <text x="88" y="34" fill="${escapeXml(theme.textColor)}" font-size="13" font-weight="700" font-family="${escapeXml(theme.fontFamily)}" letter-spacing="1.2">${escapeXml(tierLabel)}</text>

  <!-- Criteria Signal / Roast line -->
  <text x="88" y="54" fill="${escapeXml(theme.subtextColor)}" font-size="11" font-family="${escapeXml(theme.fontFamily)}">${escapeXml(topSignalText)}</text>

  <!-- Watermark Footer -->
  <text x="324" y="80" text-anchor="end" fill="${escapeXml(theme.accentColor)}" font-size="10" font-weight="600" font-family="${escapeXml(theme.fontFamily)}" opacity="0.8">cutai.org</text>
</svg>`;
}

function renderLargeBadge(input: BadgeRenderInput, theme: BadgeTheme, tierColor: string): string {
  const tierLabel = input.tier.replace(/-/g, ' ').toUpperCase();
  const { score, roast, wordCount } = input;
  const topRules = getTopRules(input.breakdown);

  // Circular gauge math (r=70, perimeter ≈ 439.8)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(score, 100) / 100) * circumference;

  let criteriaSectionHtml = '';

  if (topRules.length > 0) {
    const cardsHtml = topRules.map((rule, idx) => {
      const xPos = 180 + idx * 290;
      const barWidth = Math.min(Math.max((rule.points / 25) * 240, 30), 240);
      return `<g transform="translate(${xPos}, 420)">
        <rect width="260" height="90" rx="10" fill="${escapeXml(theme.cardBg)}" stroke="${escapeXml(theme.borderColor)}" stroke-width="1" />
        <text x="16" y="32" fill="${escapeXml(theme.textColor)}" font-size="14" font-weight="600" font-family="${escapeXml(theme.fontFamily)}">${escapeXml(truncate(rule.label, 22))}</text>
        <text x="244" y="32" text-anchor="end" fill="${escapeXml(tierColor)}" font-size="13" font-weight="700" font-family="${escapeXml(theme.fontFamily)}">+${rule.points} pts</text>
        <text x="16" y="52" fill="${escapeXml(theme.subtextColor)}" font-size="11" font-family="${escapeXml(theme.fontFamily)}">Occurrences: ${rule.count}x</text>
        <!-- Intensity Bar -->
        <rect x="16" y="66" width="228" height="6" rx="3" fill="${escapeXml(theme.borderColor)}" opacity="0.5" />
        <rect x="16" y="66" width="${barWidth.toFixed(0)}" height="6" rx="3" fill="${escapeXml(tierColor)}" />
      </g>`;
    }).join('');

    criteriaSectionHtml = `<!-- Criteria Breakdown Header -->
    <text x="600" y="395" text-anchor="middle" fill="${escapeXml(theme.subtextColor)}" font-size="12" font-weight="700" font-family="${escapeXml(theme.fontFamily)}" letter-spacing="2">TOP DETECTED SLOP SIGNALS</text>
    ${cardsHtml}`;
  } else {
    criteriaSectionHtml = `<!-- Slop Free Certificate Banner -->
    <g transform="translate(300, 415)">
      <rect width="600" height="85" rx="12" fill="${escapeXml(theme.cardBg)}" stroke="${escapeXml(tierColor)}" stroke-width="1.5" stroke-dasharray="6,4" />
      <text x="300" y="38" text-anchor="middle" fill="${escapeXml(tierColor)}" font-size="16" font-weight="700" font-family="${escapeXml(theme.fontFamily)}">✓ CERTIFIED SLOP-FREE CONTENT</text>
      <text x="300" y="62" text-anchor="middle" fill="${escapeXml(theme.subtextColor)}" font-size="13" font-family="${escapeXml(theme.fontFamily)}">Zero AI opener clichés • Natural syntax • Organic prose density</text>
    </g>`;
  }

  const wordCountText = wordCount ? `${wordCount.toLocaleString()} words analyzed` : 'Text & URL analysis engine';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="lgBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeXml(theme.bgColor)}" />
      <stop offset="100%" stop-color="${escapeXml(theme.cardBg)}" />
    </linearGradient>
    <radialGradient id="spotlight" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${escapeXml(tierColor)}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${escapeXml(tierColor)}" stop-opacity="0" />
    </radialGradient>
    <filter id="lgGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="${escapeXml(tierColor)}" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" rx="24" fill="url(#lgBgGradient)" stroke="${escapeXml(theme.borderColor)}" stroke-width="2" />
  <rect width="1200" height="630" rx="24" fill="url(#spotlight)" />

  <!-- Top Brand Header -->
  <g transform="translate(600, 48)">
    <rect x="-100" y="-18" width="200" height="34" rx="17" fill="${escapeXml(theme.cardBg)}" stroke="${escapeXml(theme.borderColor)}" stroke-width="1" />
    <text text-anchor="middle" y="4" fill="${escapeXml(theme.accentColor)}" font-size="12" font-weight="800" font-family="${escapeXml(theme.fontFamily)}" letter-spacing="2">CUTAI.ORG AUDIT</text>
  </g>

  <!-- Main Score Circular Gauge -->
  <g transform="translate(600, 175)">
    <!-- Track -->
    <circle r="${radius}" fill="${escapeXml(theme.cardBg)}" stroke="${escapeXml(theme.borderColor)}" stroke-width="8" />
    <!-- Progress Arc -->
    <circle r="${radius}" fill="none" stroke="${escapeXml(tierColor)}" stroke-width="8"
      stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${dashOffset.toFixed(1)}"
      stroke-linecap="round" transform="rotate(-90)" filter="url(#lgGlow)" />
    <!-- Score Value -->
    <text y="22" text-anchor="middle" fill="${escapeXml(theme.textColor)}" font-size="64" font-weight="900" font-family="${escapeXml(theme.fontFamily)}">${score}</text>
  </g>

  <!-- Tier Badge Label -->
  <g transform="translate(600, 285)">
    <rect x="-130" y="-18" width="260" height="36" rx="18" fill="${escapeXml(tierColor)}" opacity="0.15" />
    <text text-anchor="middle" y="5" fill="${escapeXml(tierColor)}" font-size="16" font-weight="800" font-family="${escapeXml(theme.fontFamily)}" letter-spacing="3">${escapeXml(tierLabel)}</text>
  </g>

  <!-- Roast Line -->
  <text x="600" y="348" text-anchor="middle" fill="${escapeXml(theme.textColor)}" font-size="20" font-style="italic" font-family="${escapeXml(theme.fontFamily)}">"${escapeXml(truncate(roast, 110))}"</text>

  ${criteriaSectionHtml}

  <!-- Footer Info -->
  <line x1="100" y1="560" x2="1100" y2="560" stroke="${escapeXml(theme.borderColor)}" stroke-width="1" opacity="0.5" />
  <text x="120" y="590" fill="${escapeXml(theme.subtextColor)}" font-size="13" font-family="${escapeXml(theme.fontFamily)}">${escapeXml(wordCountText)}</text>
  <text x="1080" y="590" text-anchor="end" fill="${escapeXml(theme.accentColor)}" font-size="13" font-weight="700" font-family="${escapeXml(theme.fontFamily)}">cutai.org • Slop Detector Engine</text>
</svg>`;
}


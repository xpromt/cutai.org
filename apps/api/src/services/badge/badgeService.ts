import { renderBadgeSvgDirect } from './renderSvg.js';
import type { BadgeRenderInput } from './themes.js';

/**
 * Render a badge as SVG directly (no Satori/fonts needed).
 * PNG rendering via @resvg/resvg-js available for future upgrade.
 */
export function renderSvg(input: BadgeRenderInput): string {
  return renderBadgeSvgDirect(input);
}

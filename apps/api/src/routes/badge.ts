import type { FastifyInstance } from 'fastify';
import { renderSvg } from '../services/badge/badgeService.js';
import { themes, DEFAULT_THEME } from '../services/badge/themes.js';
import type { BadgeSize, RuleHitInput } from '../services/badge/themes.js';
import { findBySlug } from '../repositories/siteRepository.js';
import { findLatestBySite } from '../repositories/scanRepository.js';

const VALID_THEMES = new Set(Object.keys(themes));

export function badgeRoutes(app: FastifyInstance) {
  app.get('/badge/:slug.svg', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const query = request.query as { theme?: string; size?: string };
    const theme = query.theme && VALID_THEMES.has(query.theme) ? query.theme : DEFAULT_THEME;
    const size: BadgeSize = query.size === 'lg' ? 'lg' : 'sm';

    const site = await findBySlug(slug);
    let score = 0;
    let tier = 'certified-human';
    let roast = 'No scan yet. Check your site at cutai.org.';
    let breakdown: RuleHitInput[] | undefined;
    let wordCount: number | null = null;

    if (site) {
      const latest = await findLatestBySite(site.id);
      if (latest && latest.status === 'DONE' && latest.score !== null && latest.tier !== null) {
        score = latest.score;
        tier = latest.tier;
        roast = latest.roast ?? roast;
        breakdown = Array.isArray(latest.breakdown) ? (latest.breakdown as RuleHitInput[]) : undefined;
        wordCount = latest.wordCount;
      }
    }

    const svg = renderSvg({ score, tier, roast, theme, size, breakdown, wordCount });

    reply.header('Content-Type', 'image/svg+xml');
    reply.header('Cache-Control', site && score > 0 ? 'public, max-age=3600, stale-while-revalidate=86400' : 'public, max-age=60');
    return reply.send(svg);
  });

  app.get('/badge/:slug.png', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const query = request.query as { theme?: string; size?: string };
    const theme = query.theme && VALID_THEMES.has(query.theme) ? query.theme : DEFAULT_THEME;
    const size: BadgeSize = query.size === 'lg' ? 'lg' : 'sm';

    const site = await findBySlug(slug);
    let score = 0;
    let tier = 'certified-human';
    let roast = 'No scan yet. Check your site at cutai.org.';
    let breakdown: RuleHitInput[] | undefined;
    let wordCount: number | null = null;

    if (site) {
      const latest = await findLatestBySite(site.id);
      if (latest && latest.status === 'DONE' && latest.score !== null && latest.tier !== null) {
        score = latest.score;
        tier = latest.tier;
        roast = latest.roast ?? roast;
        breakdown = Array.isArray(latest.breakdown) ? (latest.breakdown as RuleHitInput[]) : undefined;
        wordCount = latest.wordCount;
      }
    }

    const svg = renderSvg({ score, tier, roast, theme, size, breakdown, wordCount });

    // For PNG, wrap SVG in a data URI and serve as PNG via resvg if available
    // v1: serve the SVG with .png extension (simple approach)
    // Future: use @resvg/resvg-js to rasterize
    reply.header('Content-Type', 'image/svg+xml');
    reply.header('Cache-Control', site && score > 0 ? 'public, max-age=3600, stale-while-revalidate=86400' : 'public, max-age=60');
    return reply.send(svg);
  });
}


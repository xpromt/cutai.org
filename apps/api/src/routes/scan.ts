import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { normalizeUrl, urlToSlug } from '../lib/url.js';
import { getQueue } from '../lib/queue.js';
import { upsertSite, findBySlug } from '../repositories/siteRepository.js';
import { createScan, findLatestBySite } from '../repositories/scanRepository.js';

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function scanRoutes(app: FastifyInstance) {
  app.post('/api/scan', {
    config: {
      rateLimit: {
        max: config.SCAN_RATE_LIMIT_PER_HOUR,
        timeWindow: '1 hour',
      },
    },
    schema: {
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', minLength: 1 },
          publicListing: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { url, publicListing } = request.body as { url: string; publicListing?: boolean };

    const normalized = normalizeUrl(url);
    if (!normalized) {
      return reply.status(400).send({ error: 'invalid URL' });
    }

    const parsed = new URL(normalized);
    const slug = urlToSlug(normalized);
    const site = await upsertSite(normalized, slug, parsed.hostname, publicListing);

    // Non-terminal guard: if a scan is already QUEUED or RUNNING, return that
    // But if it's been QUEUED for >5min, it's stale (job was lost) — proceed
    const STALE_QUEUED_MS = 5 * 60 * 1000;
    const latest = await findLatestBySite(site.id);
    if (latest && (latest.status === 'RUNNING' || (latest.status === 'QUEUED' && Date.now() - latest.createdAt.getTime() < STALE_QUEUED_MS))) {
      const statusCode = latest.status === 'RUNNING' ? 200 : 202;
      return reply.status(statusCode).send({ slug, status: latest.status.toLowerCase() });
    }

    // Recent-done shortcut: if the latest is DONE and less than 24h old, return cached
    if (latest && latest.status === 'DONE' && latest.createdAt.getTime() > Date.now() - RECENT_WINDOW_MS) {
      return reply.status(200).send({
        slug,
        status: 'done',
        scan: {
          score: latest.score,
          tier: latest.tier,
          roast: latest.roast,
          breakdown: latest.breakdown,
          wordCount: latest.wordCount,
          createdAt: latest.createdAt,
        },
      });
    }

    // Create new scan and enqueue
    const scan = await createScan(site.id);
    const queue = getQueue(config.REDIS_URL);
    await queue.add('scan', { scanId: scan.id, siteId: site.id, url: normalized }, {
      jobId: scan.id,
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    return reply.status(202).send({ slug, status: 'queued' });
  });

  app.get('/api/scan/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const site = await findBySlug(slug);
    if (!site) {
      return reply.status(404).send({ error: 'not found' });
    }

    const latest = await findLatestBySite(site.id);
    if (!latest) {
      return reply.status(200).send({ slug, url: site.normalizedUrl, status: 'queued' });
    }

    const status = latest.status.toLowerCase();
    const response: Record<string, unknown> = { slug, url: site.normalizedUrl, status };

    if (latest.status === 'DONE') {
      response.scan = {
        score: latest.score,
        tier: latest.tier,
        roast: latest.roast,
        breakdown: latest.breakdown,
        wordCount: latest.wordCount,
        createdAt: latest.createdAt,
      };
    } else if (latest.status === 'FAILED') {
      response.error = latest.error;
    }

    return reply.status(200).send(response);
  });
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { config } from './config.js';
import { healthRoutes } from './routes/health.js';
import { scoreRoutes } from './routes/score.js';
import { scanRoutes } from './routes/scan.js';
import { badgeRoutes } from './routes/badge.js';

export interface BuildOptions {
  redisUrl?: string;
  logger?: boolean;
}

export function buildApp(opts?: BuildOptions) {
  const app = Fastify({ logger: opts?.logger ?? true });

  // Plugins
  app.register(cors, { origin: config.WEB_ORIGIN });

  // Rate limiter: uses Redis if a URL is provided, otherwise in-memory
  if (opts?.redisUrl) {
    const redis = new Redis(opts.redisUrl);
    app.register(rateLimit, {
      redis,
      keyGenerator: (req) => req.ip,
    });
  } else {
    app.register(rateLimit, {
      keyGenerator: (req) => req.ip,
    });
  }

  // Routes
  app.register(healthRoutes);
  app.register(scoreRoutes);
  app.register(scanRoutes);
  app.register(badgeRoutes);

  return { app };
}

// Start only when this is the entry point (not in tests)
const isEntry = process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('dist/server.js');
if (isEntry) {
  const { app } = buildApp({ redisUrl: config.REDIS_URL });
  app.listen({ port: config.PORT, host: '0.0.0.0' });
}

import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/server.js';

describe('POST /api/scan', () => {
  it('returns 400 for invalid URL', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan',
      payload: { url: '' },
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it('returns 400 for missing url field', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });
});

// Full scan pipeline integration tests (GET /api/scan/:slug, non-terminal guard,
// recent-done shortcut, enqueue) require Postgres + Redis running via docker-compose.
// Run manually: `docker compose up -d && npm run dev:api`

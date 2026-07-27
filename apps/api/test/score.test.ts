import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/server.js';

describe('POST /api/score', () => {
  it('returns a scan result for valid text', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/score',
      payload: { text: 'This is a test sentence with no slop at all.' },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('tier');
    expect(body).toHaveProperty('breakdown');
    expect(body).toHaveProperty('roast');
    expect(body).toHaveProperty('wordCount');
    expect(body).toHaveProperty('lowConfidence');
    expect(typeof body.score).toBe('number');
    await app.close();
  });

  it('returns 400 for empty text', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/score',
      payload: { text: '' },
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it('returns 400 for missing text', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/score',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it('returns 400 for text exceeding max length', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/score',
      payload: { text: 'x'.repeat(50_001) },
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });
});

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true });
    await app.close();
  });
});

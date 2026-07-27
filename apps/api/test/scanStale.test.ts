import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock repositories before importing the app so the route uses our fakes.
vi.mock('../src/repositories/siteRepository.js', () => ({
  upsertSite: vi.fn(),
  findBySlug: vi.fn(),
}));
vi.mock('../src/repositories/scanRepository.js', () => ({
  createScan: vi.fn(),
  findLatestBySite: vi.fn(),
  markRunning: vi.fn(),
  markDone: vi.fn(),
  markFailed: vi.fn(),
}));
vi.mock('../src/lib/queue.js', () => ({
  getQueue: vi.fn(() => ({ add: vi.fn() })),
}));

import { buildApp } from '../src/server.js';
import { findBySlug } from '../src/repositories/siteRepository.js';
import { findLatestBySite } from '../src/repositories/scanRepository.js';

const mockedFindBySlug = vi.mocked(findBySlug);
const mockedFindLatestBySite = vi.mocked(findLatestBySite);

const SITE = {
  id: 'site-1',
  normalizedUrl: 'https://example.com/',
  slug: 'abc123',
  hostname: 'example.com',
  autoRescan: false,
  publicListing: false,
  lastScannedAt: null,
  createdAt: new Date(),
};

describe('GET /api/scan/:slug — stale detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFindBySlug.mockResolvedValue(SITE as never);
  });

  it('returns status "stale" when QUEUED for over 5 minutes', async () => {
    const oldScan = {
      id: 'scan-1',
      siteId: 'site-1',
      status: 'QUEUED' as const,
      score: null,
      tier: null,
      roast: null,
      breakdown: null,
      wordCount: null,
      error: null,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      completedAt: null,
    };
    mockedFindLatestBySite.mockResolvedValue(oldScan as never);

    const { app } = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/scan/abc123' });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('stale');
    await app.close();
  });

  it('returns status "stale" when RUNNING for over 5 minutes', async () => {
    const oldScan = {
      id: 'scan-2',
      siteId: 'site-1',
      status: 'RUNNING' as const,
      score: null,
      tier: null,
      roast: null,
      breakdown: null,
      wordCount: null,
      error: null,
      createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 min ago
      completedAt: null,
    };
    mockedFindLatestBySite.mockResolvedValue(oldScan as never);

    const { app } = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/scan/abc123' });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('stale');
    await app.close();
  });

  it('returns status "queued" when QUEUED for under 5 minutes', async () => {
    const freshScan = {
      id: 'scan-3',
      siteId: 'site-1',
      status: 'QUEUED' as const,
      score: null,
      tier: null,
      roast: null,
      breakdown: null,
      wordCount: null,
      error: null,
      createdAt: new Date(Date.now() - 30 * 1000), // 30s ago
      completedAt: null,
    };
    mockedFindLatestBySite.mockResolvedValue(freshScan as never);

    const { app } = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/scan/abc123' });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('queued');
    await app.close();
  });

  it('returns status "done" (not stale) for old DONE scans', async () => {
    const oldDone = {
      id: 'scan-4',
      siteId: 'site-1',
      status: 'DONE' as const,
      score: 42,
      tier: 'slop-adjacent',
      roast: 'roast line',
      breakdown: [],
      wordCount: 500,
      error: null,
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      completedAt: new Date(Date.now() - 60 * 60 * 1000),
    };
    mockedFindLatestBySite.mockResolvedValue(oldDone as never);

    const { app } = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/scan/abc123' });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('done');
    expect(body.scan.score).toBe(42);
    await app.close();
  });
});

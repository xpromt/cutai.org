import { describe, it, expect } from 'vitest';
import { SiteFetcher } from '../src/services/siteFetcher';
import type { SiteFetcherDeps } from '../src/services/siteFetcher';

describe('SiteFetcher', () => {
  it('rejects invalid URLs', async () => {
    const fetcher = new SiteFetcher();
    const result = await fetcher.extract('not-a-url');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-url');
  });

  it('rejects private IP URLs', async () => {
    const fetcher = new SiteFetcher();
    const result = await fetcher.extract('http://127.0.0.1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked-host');
  });

  it('rejects file:// URLs', async () => {
    const fetcher = new SiteFetcher();
    const result = await fetcher.extract('file:///etc/passwd');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked-scheme');
  });

  it('uses injectable deps (mock request throws)', async () => {
    const mockRequest = async () => {
      throw new Error('intentional mock rejection');
    };
    const fetcher = new SiteFetcher({
      request: mockRequest as unknown as SiteFetcherDeps['request'],
    });
    const result = await fetcher.extract('http://example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('fetch-failed');
  });

  it('rejects with blocked-host when DNS resolves to private IP', async () => {
    const mockLookup = async () => [{ address: '10.0.0.1', family: 4 }];
    const mockRequest = async () => ({
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: {
        destroy() {},
        [Symbol.asyncIterator]() { return { next: async () => ({ done: true, value: '' }) }; },
      },
    });
    const fetcher = new SiteFetcher({
      lookup: mockLookup as unknown as SiteFetcherDeps['lookup'],
      request: mockRequest as unknown as SiteFetcherDeps['request'],
      abortSignal: () => ({ aborted: false }) as AbortSignal,
    });
    const result = await fetcher.extract('http://evil.example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked-host');
  });
});

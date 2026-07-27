import { request as undiciRequest } from 'undici';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { validateUrl, resolveAndValidate } from '../lib/ssrf.js';
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

// ─── Types ──────────────────────────────────────────────────────────────

export type FetchFailure =
  | 'invalid-url'
  | 'blocked-host'
  | 'blocked-scheme'
  | 'dns-failure'
  | 'timeout'
  | 'too-large'
  | 'http-error'
  | 'not-html'
  | 'insufficient-content'
  | 'fetch-failed';

export type FetchResult =
  | { ok: true; text: string; title: string | null; finalUrl: string; wordCount: number }
  | { ok: false; reason: FetchFailure; status?: number };

export interface SiteFetcherDeps {
  /** dns.lookup override for testability */
  lookup: typeof dnsLookup;
  /** undici request override for testability */
  request: typeof undiciRequest;
  /** Abort signal factory — defaults to AbortSignal.timeout */
  abortSignal: (ms: number) => AbortSignal;
  /** Max body bytes */
  maxBytes: number;
  /** Max redirect hops */
  maxRedirects: number;
  /** Min extracted words to consider valid content */
  minWords: number;
}

// ─── Service ────────────────────────────────────────────────────────────

const MIN_WORDS = 100;
const MAX_BYTES = 5_242_880;
const MAX_REDIRECTS = 5;
const TIMEOUT = 5_000;

export class SiteFetcher {
  private deps: SiteFetcherDeps;

  constructor(deps?: Partial<SiteFetcherDeps>) {
    this.deps = {
      lookup: deps?.lookup ?? dnsLookup,
      request: deps?.request ?? undiciRequest,
      abortSignal: deps?.abortSignal ?? ((ms) => AbortSignal.timeout(ms)),
      maxBytes: deps?.maxBytes ?? MAX_BYTES,
      maxRedirects: deps?.maxRedirects ?? MAX_REDIRECTS,
      minWords: deps?.minWords ?? MIN_WORDS,
    };
  }

  async extract(urlStr: string): Promise<FetchResult> {
    return this.fetchWithRedirects(urlStr, 0);
  }

  private async fetchWithRedirects(urlStr: string, hop: number): Promise<FetchResult> {
    if (hop > this.deps.maxRedirects) {
      return { ok: false, reason: 'fetch-failed' };
    }

    // 1. Validate URL
    const validated = validateUrl(urlStr);
    if (typeof validated === 'string') {
      return { ok: false, reason: validated };
    }

    const { hostname } = validated;

    // 2. DNS resolve + IP check
    const resolved = isIP(hostname)
      ? { ip: hostname, family: (isIP(hostname) as 4 | 6) }
      : await resolveAndValidate(hostname, this.deps.lookup);

    if (typeof resolved === 'string') {
      return { ok: false, reason: resolved };
    }

    // 3. Fetch
    const signal = this.deps.abortSignal(TIMEOUT);

    try {
      let body = '';
      let contentLength = 0;

      const response = await this.deps.request(urlStr, {
        signal,
        headersTimeout: TIMEOUT,
        bodyTimeout: TIMEOUT,
        maxRedirections: 0, // we handle redirects manually
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SlopDetector/1.0; +https://cutai.org)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      } as Record<string, unknown>);

      // 4. Check content-type
      const contentType = response.headers['content-type'] ?? '';
      if (!contentType.includes('html') && !contentType.includes('text')) {
        response.body.destroy();
        return { ok: false, reason: 'not-html' };
      }

      // 5. Check status
      if (response.statusCode < 200 || response.statusCode >= 300) {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400) {
          const location = response.headers.location;
          if (location) {
            const nextUrl = new URL(location, urlStr).href;
            response.body.destroy();
            return this.fetchWithRedirects(nextUrl, hop + 1);
          }
        }
        response.body.destroy();
        return { ok: false, reason: 'http-error', status: response.statusCode };
      }

      // 6. Read body with size cap
      for await (const chunk of response.body) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        contentLength += buf.length;
        if (contentLength > this.deps.maxBytes) {
          response.body.destroy();
          return { ok: false, reason: 'too-large' };
        }
        body += buf.toString('utf-8');
      }

      // 7. Extract text via Readability
      const { document } = parseHTML(body);
      const reader = new Readability(document);
      const article = reader.parse();

      if (!article || !article.textContent) {
        return { ok: false, reason: 'insufficient-content' };
      }

      const text = article.textContent.replace(/\s+/g, ' ').trim();
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      if (wordCount < this.deps.minWords) {
        return { ok: false, reason: 'insufficient-content' };
      }

      return {
        ok: true,
        text,
        title: article.title || null,
        finalUrl: urlStr,
        wordCount,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { ok: false, reason: 'timeout' };
      }
      return { ok: false, reason: 'fetch-failed' };
    }
  }
}

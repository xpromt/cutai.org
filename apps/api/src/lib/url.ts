import { createHash } from 'node:crypto';

/**
 * Normalize a user-supplied URL:
 * - add https:// if scheme missing
 * - lowercase scheme+host
 * - strip fragment
 * - strip default ports
 * - collapse trailing /
 * - sort query params, drop tracking params
 */
export function normalizeUrl(input: string): string | null {
  let url: URL;
  try {
    // Only prefix if there's no scheme at all (don't mangle ftp:// etc.)
    const hasScheme = /^[a-z][a-z0-9+\-.]*:\/\//i.test(input);
    const withScheme = hasScheme ? input : `https://${input}`;
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const scheme = url.protocol.toLowerCase();
  if (scheme !== 'http:' && scheme !== 'https:') return null;

  const hostname = url.hostname.toLowerCase();
  const port = url.port;
  // Strip default ports
  const portStr = port && ((scheme === 'https:' && port !== '443') || (scheme === 'http:' && port !== '80')) ? `:${port}` : '';

  // Sort query params, dropping tracking ones
  const dropKeys = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref']);
  const params = [...url.searchParams.entries()]
    .filter(([k]) => !dropKeys.has(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const queryStr = params ? `?${params}` : '';
  const path = url.pathname.replace(/\/+$/, '') || '/';

  return `${scheme}//${hostname}${portStr}${path}${queryStr}`;
}

/**
 * 10-char base64url slug from SHA-256 of the normalized URL.
 */
export function urlToSlug(normalizedUrl: string): string {
  const hash = createHash('sha256').update(normalizedUrl).digest('base64url');
  return hash.slice(0, 10);
}

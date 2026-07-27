import { describe, it, expect } from 'vitest';
import { normalizeUrl, urlToSlug } from '../src/lib/url.js';

describe('normalizeUrl', () => {
  it('adds https:// when missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
  });

  it('lowercases scheme and host', () => {
    expect(normalizeUrl('HTTP://EXAMPLE.COM/Path')).toBe('http://example.com/Path');
  });

  it('strips default https port', () => {
    expect(normalizeUrl('https://example.com:443/')).toBe('https://example.com/');
  });

  it('keeps non-default port', () => {
    expect(normalizeUrl('https://example.com:8080/')).toBe('https://example.com:8080/');
  });

  it('strips fragment', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });

  it('collapses trailing slash', () => {
    expect(normalizeUrl('https://example.com/page///')).toBe('https://example.com/page');
  });

  it('strips tracking query params', () => {
    const result = normalizeUrl('https://example.com/?utm_source=twitter&a=1&utm_medium=social');
    expect(result).toContain('a=1');
    expect(result).not.toContain('utm_');
  });

  it('sorts query params', () => {
    const result = normalizeUrl('https://example.com/?z=1&a=2');
    expect(result).toBe('https://example.com/?a=2&z=1');
  });

  it('rejects non-http schemes', () => {
    expect(normalizeUrl('ftp://example.com')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(normalizeUrl('')).toBeNull();
  });
});

describe('urlToSlug', () => {
  it('produces a 10-char slug', () => {
    const slug = urlToSlug('https://example.com/');
    expect(slug).toHaveLength(10);
  });

  it('is deterministic', () => {
    const url = 'https://example.com/some-page';
    expect(urlToSlug(url)).toBe(urlToSlug(url));
  });

  it('differs for different URLs', () => {
    expect(urlToSlug('https://a.com/')).not.toBe(urlToSlug('https://b.com/'));
  });
});

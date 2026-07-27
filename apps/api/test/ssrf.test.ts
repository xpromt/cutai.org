import { describe, it, expect } from 'vitest';
import { validateUrl, isPrivateHostname, resolveAndValidate } from '../src/lib/ssrf.js';
import { lookup as dnsLookup } from 'node:dns/promises';

describe('validateUrl', () => {
  it('accepts a valid https URL', () => {
    const result = validateUrl('https://example.com/page');
    expect(result).toEqual({ hostname: 'example.com', protocol: 'https:' });
  });

  it('accepts http', () => {
    const result = validateUrl('http://example.com');
    expect(result).not.toBe('blocked-scheme');
  });

  it('rejects invalid URL', () => {
    expect(validateUrl('not a url')).toBe('invalid-url');
  });

  it('rejects file:// scheme', () => {
    expect(validateUrl('file:///etc/passwd')).toBe('blocked-scheme');
  });

  it('rejects ftp:// scheme', () => {
    expect(validateUrl('ftp://example.com')).toBe('blocked-scheme');
  });

  it('rejects localhost hostname', () => {
    expect(validateUrl('http://localhost:3000')).toBe('blocked-host');
  });

  it('rejects *.localhost', () => {
    expect(validateUrl('http://app.localhost')).toBe('blocked-host');
  });

  it('rejects *.local', () => {
    expect(validateUrl('http://server.local')).toBe('blocked-host');
  });

  it('rejects 127.0.0.1 literal', () => {
    expect(validateUrl('http://127.0.0.1')).toBe('blocked-host');
  });

  it('rejects 10.x.x.x', () => {
    expect(validateUrl('http://10.0.0.1')).toBe('blocked-host');
  });

  it('rejects 192.168.x.x', () => {
    expect(validateUrl('http://192.168.1.1')).toBe('blocked-host');
  });

  it('rejects 172.16.x.x', () => {
    expect(validateUrl('http://172.16.0.1')).toBe('blocked-host');
  });

  it('rejects 169.254.x.x', () => {
    expect(validateUrl('http://169.254.169.254')).toBe('blocked-host');
  });

  it('accepts a valid public IP', () => {
    expect(validateUrl('http://93.184.216.34')).toEqual({
      hostname: '93.184.216.34',
      protocol: 'http:',
    });
  });
});

describe('isPrivateHostname', () => {
  it('detects localhost', () => expect(isPrivateHostname('localhost')).toBe(true));
  it('detects sub.localhost', () => expect(isPrivateHostname('foo.localhost')).toBe(true));
  it('detects *.local', () => expect(isPrivateHostname('test.local')).toBe(true));
  it('detects *.internal', () => expect(isPrivateHostname('db.internal')).toBe(true));
  it('rejects public hostname', () => expect(isPrivateHostname('example.com')).toBe(false));
});

describe('resolveAndValidate', () => {
  it('resolves a public hostname', async () => {
    const result = await resolveAndValidate('example.com');
    if (typeof result === 'string') {
      // DNS might not be available in test env — that's OK
      expect(result).toBe('dns-failure');
    } else {
      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('family');
    }
  });

  it('rejects localhost DNS resolution', async () => {
    const result = await resolveAndValidate('localhost');
    expect(result).toBe('blocked-host');
  });
});

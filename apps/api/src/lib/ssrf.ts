import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

type LookupFn = typeof dnsLookup;

export interface SafeUrl {
  hostname: string;
  port: number;
  ip: string;
  family: 4 | 6;
}

export type SsrfError =
  | 'invalid-url'
  | 'blocked-scheme'
  | 'blocked-host'
  | 'dns-failure';

// ─── CIDR checker (no dependency) ───────────────────────────────────────

function parseIpv4(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipv4InRange(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const ipNum = parseIpv4(ip);
  const baseNum = parseIpv4(base);
  if (ipNum === null || baseNum === null) return false;
  const mask = ~(2 ** (32 - bits) - 1);
  return (ipNum & mask) === (baseNum & mask);
}

const BLOCKED_V4_RANGES = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '224.0.0.0/4',
  '240.0.0.0/4',
];

/** Naive IPv6 string → big-endian bytes, then check fc00::/7, fe80::/10 etc. */
function isBlockedIpv6(ip: string): boolean {
  // ::1 (loopback)
  if (ip === '::1' || ip.toLowerCase() === '::1') return true;

  // fc00::/7 (unique local)
  if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true;

  // fe80::/10 (link-local)
  if (ip.toLowerCase().startsWith('fe8') || ip.toLowerCase().startsWith('fe9')
    || ip.toLowerCase().startsWith('fea') || ip.toLowerCase().startsWith('feb')) return true;

  // IPv4-mapped IPv6: ::ffff:x.x.x.x
  const v4mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (v4mapped) {
    return BLOCKED_V4_RANGES.some(range => ipv4InRange(v4mapped[1], range));
  }

  return false;
}

function isBlockedIpv4(ip: string): boolean {
  return BLOCKED_V4_RANGES.some(range => ipv4InRange(ip, range));
}

function isBlockedIp(ip: string): boolean {
  if (isIP(ip) === 4) return isBlockedIpv4(ip);
  if (isIP(ip) === 6) return isBlockedIpv6(ip);
  return false;
}

// ─── Public API ─────────────────────────────────────────────────────────

export function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return lower === 'localhost'
    || lower.endsWith('.localhost')
    || lower.endsWith('.local')
    || lower.endsWith('.internal');
}

export async function resolveAndValidate(
  hostname: string,
  lookup: LookupFn = dnsLookup,
): Promise<{ ip: string; family: 4 | 6 } | SsrfError> {
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });

    for (const addr of addresses) {
      if (isBlockedIp(addr.address)) {
        return 'blocked-host';
      }
    }

    // Pick the first public address
    const first = addresses[0];
    return { ip: first.address, family: first.family as 4 | 6 };
  } catch {
    return 'dns-failure';
  }
}

export function validateUrl(urlStr: string): { hostname: string; protocol: string } | SsrfError {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return 'invalid-url';
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'blocked-scheme';
  }

  const hostname = url.hostname.toLowerCase();

  if (isPrivateHostname(hostname)) {
    return 'blocked-host';
  }

  // If the hostname is already an IP literal, check it directly
  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) return 'blocked-host';
  }

  return { hostname, protocol: url.protocol };
}

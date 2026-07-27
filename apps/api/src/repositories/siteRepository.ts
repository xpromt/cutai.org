import { prisma } from '../lib/prisma.js';

export interface SiteRecord {
  id: string;
  normalizedUrl: string;
  slug: string;
  hostname: string;
  autoRescan: boolean;
  publicListing: boolean;
  lastScannedAt: Date | null;
  createdAt: Date;
}

export async function upsertSite(
  normalizedUrl: string,
  slug: string,
  hostname: string,
  publicListing?: boolean,
): Promise<SiteRecord> {
  return prisma.site.upsert({
    where: { normalizedUrl },
    update: publicListing !== undefined ? { publicListing } : {},
    create: {
      normalizedUrl,
      slug,
      hostname,
      publicListing: publicListing ?? false,
    },
  }) as unknown as SiteRecord;
}

export async function findBySlug(slug: string): Promise<SiteRecord | null> {
  return prisma.site.findUnique({ where: { slug } }) as unknown as SiteRecord | null;
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasourceUrl: 'postgresql://postgres:postgres@localhost:5433/cutai' });
const scans = await prisma.scan.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
for (const s of scans) {
  console.log({ id: s.id, siteId: s.siteId, status: s.status, score: s.score, tier: s.tier, roast: s.roast?.slice(0, 60), error: s.error });
}
await prisma.$disconnect();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Find and delete the stuck QUEUED scan that has no BullMQ job
const stuckScans = await prisma.scan.findMany({ where: { status: 'QUEUED' } });
console.log(`Found ${stuckScans.length} stuck QUEUED scans:`);
for (const s of stuckScans) {
  console.log(`  ${s.id} siteId=${s.siteId}`);
  // Delete it so a fresh submission can proceed
  await prisma.scan.delete({ where: { id: s.id } });
  console.log('  Deleted');
}

console.log('Done. Submit the URL again on /scan');
await prisma.$disconnect();

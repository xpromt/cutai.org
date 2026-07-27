import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { scoreText } from '@cutai/slop-rules';
import { SiteFetcher } from './services/siteFetcher.js';
import { markRunning, markDone, markFailed } from './repositories/scanRepository.js';
import { prisma } from './lib/prisma.js';
import { config } from './config.js';

interface JobData {
  scanId: string;
  siteId: string;
  url: string;
}

async function processScan(job: { data: JobData }): Promise<void> {
  const { scanId, siteId, url } = job.data;

  await markRunning(scanId);

  const fetcher = new SiteFetcher();
  const fetchResult = await fetcher.extract(url);

  if (!fetchResult.ok) {
    await markFailed(scanId, fetchResult.reason);
    // Update site lastScannedAt even for failures
    await prisma.site.update({ where: { id: siteId }, data: { lastScannedAt: new Date() } });
    return;
  }

  const result = scoreText(fetchResult.text);
  await markDone(scanId, result);

  await prisma.site.update({
    where: { id: siteId },
    data: { lastScannedAt: new Date() },
  });
}

const isEntry = process.argv[1]?.endsWith('worker.ts') || process.argv[1]?.endsWith('dist/worker.js');
if (isEntry) {
  const connection = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker('site-scan', processScan, {
    connection,
    concurrency: 5,
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log('Worker started, waiting for jobs...');
}

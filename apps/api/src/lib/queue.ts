import { Queue } from 'bullmq';
import Redis from 'ioredis';

let queue: Queue | null = null;

export function getQueue(redisUrl: string): Queue {
  if (!queue) {
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    queue = new Queue('site-scan', { connection });
  }
  return queue;
}

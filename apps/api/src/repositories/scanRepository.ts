import { prisma } from '../lib/prisma.js';
import type { ScanResult } from '@cutai/slop-rules';
import type { Prisma } from '@prisma/client';
type PrismaJsonValue = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

type ScanStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

export interface ScanRecord {
  id: string;
  siteId: string;
  status: ScanStatus;
  score: number | null;
  tier: string | null;
  roast: string | null;
  breakdown: unknown;
  wordCount: number | null;
  error: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export async function createScan(siteId: string): Promise<ScanRecord> {
  return prisma.scan.create({
    data: { siteId, status: 'QUEUED' },
  }) as unknown as ScanRecord;
}

export async function findLatestBySite(siteId: string): Promise<ScanRecord | null> {
  return prisma.scan.findFirst({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
  }) as unknown as ScanRecord | null;
}

export async function markRunning(scanId: string): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: { status: 'RUNNING' },
  });
}

export async function markDone(
  scanId: string,
  result: ScanResult,
): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'DONE',
      score: result.score,
      tier: result.tier,
      roast: result.roast,
      breakdown: result.breakdown as unknown as PrismaJsonValue,
      wordCount: result.wordCount,
      completedAt: new Date(),
    },
  });
}

export async function markFailed(
  scanId: string,
  error: string,
): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'FAILED',
      error,
      completedAt: new Date(),
    },
  });
}

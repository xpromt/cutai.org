import { PrismaClient } from '@prisma/client';

// Prisma client validates env("DATABASE_URL") from schema.prisma at init time,
// so we must set the env var before creating the client.
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/cutai';
process.env.DATABASE_URL ||= databaseUrl;

export const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

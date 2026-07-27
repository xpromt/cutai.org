import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5433/cutai'),
  REDIS_URL: z.string().url().default('redis://localhost:6382'),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  SCORE_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(30),
  SCAN_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(10),
  FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  FETCH_MAX_BYTES: z.coerce.number().int().positive().default(5_242_880),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten());
    process.exit(1);
  }
  return result.data;
}

export const config = loadConfig();

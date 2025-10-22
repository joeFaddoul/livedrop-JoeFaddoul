import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((value) => Number.parseInt(value, 10)),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  LLM_BASE_URL: z.string().url('LLM_BASE_URL must be a valid URL'),
  LLM_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.format()); // eslint-disable-line no-console
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

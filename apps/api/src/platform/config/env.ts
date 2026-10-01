import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default('0.0.0.0'),

    PERSISTENCE_DRIVER: z.enum(['memory', 'prisma']).default('prisma'),
    DATABASE_URL: z.string().optional(),

    REDIS_URL: z.string().optional(),

    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_ISSUER: z.string().default('know-your-route'),
    JWT_AUDIENCE: z.string().default('know-your-route'),

    CORS_ORIGINS: z.string().optional(),

    STORAGE_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    STORAGE_ENDPOINT: z.string().optional(),
    STORAGE_BUCKET: z.string().default('know-your-route-assets'),
    STORAGE_ACCESS_KEY: z.string().optional(),
    STORAGE_SECRET_KEY: z.string().optional(),
    STORAGE_REGION: z.string().default('ap-south-1'),
    STORAGE_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
    STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    STORAGE_FORCE_PATH_STYLE: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),

    MAP_PROVIDER: z.string().default('mock'),
    WEATHER_PROVIDER: z.string().default('mock'),
    VEHICLE_PROVIDER: z.string().default('mock'),
    FASTAG_PROVIDER: z.string().default('mock'),
    AI_PROVIDER: z.string().default('mock'),

    GOOGLE_MAPS_API_KEY: z.string().optional(),
    OPENWEATHER_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),

    LOG_LEVEL: z
      .enum(['debug', 'info', 'warn', 'error'])
      .optional(),

    BODY_LIMIT: z.string().default('1mb'),
    RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    ENABLE_SWAGGER: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === 'production') {
      if (val.PERSISTENCE_DRIVER !== 'prisma') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['PERSISTENCE_DRIVER'],
          message: 'Production requires PERSISTENCE_DRIVER=prisma',
        });
      }
      if (!val.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'Production requires DATABASE_URL',
        });
      }
      if (!val.REDIS_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['REDIS_URL'],
          message: 'Production requires REDIS_URL',
        });
      }
      if (
        val.JWT_SECRET.length < 32 ||
        val.JWT_SECRET.includes('dev-') ||
        val.JWT_SECRET.includes('supersecret')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message:
            'Production requires a strong JWT_SECRET (>=32 chars, not a dev placeholder)',
        });
      }
      if (!val.CORS_ORIGINS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGINS'],
          message: 'Production requires explicit CORS_ORIGINS',
        });
      }
      if (
        val.STORAGE_ENABLED &&
        (!val.STORAGE_ENDPOINT || !val.STORAGE_ACCESS_KEY || !val.STORAGE_SECRET_KEY)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['STORAGE_ENABLED'],
          message:
            'Production with STORAGE_ENABLED requires STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY',
        });
      }
    }

    if (val.NODE_ENV === 'test' && val.DATABASE_URL) {
      const dbName = val.DATABASE_URL.split('/').pop()?.split('?')[0] ?? '';
      if (!dbName.includes('test')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message:
            'Test environment DATABASE_URL must point to a database whose name contains "test"',
        });
      }
    }

    if (val.PERSISTENCE_DRIVER === 'prisma' && !val.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL is required when PERSISTENCE_DRIVER=prisma',
      });
    }
  });

export type AppConfig = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): AppConfig {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  rateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS ?? 60000),
  rateLimitMax: Number(process.env.API_RATE_LIMIT_MAX ?? 120),
  smtpSecretKey: process.env.SMTP_SECRET_KEY ?? ''
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (env.smtpSecretKey.length < 32) {
  throw new Error('SMTP_SECRET_KEY is required and must be at least 32 characters');
}

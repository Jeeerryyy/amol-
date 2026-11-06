import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates critical environment variables and returns sanitized config.
 * Fails fast on startup if configuration is invalid or missing in production.
 */
export function getEnvConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const isVercel = Boolean(process.env.VERCEL);

  const config = {
    isProd,
    isVercel,
    port: parseInt(process.env.PORT || '3001', 10),
    databaseUrl: process.env.DATABASE_URL || '',
    databaseSsl: process.env.DATABASE_SSL !== 'false',
    aiApiKey: process.env.AI_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'gemini-2.5-flash',
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    adminEmail: (process.env.ADMIN_EMAIL || 'owner@amolvegresto.in').trim().toLowerCase(),
    adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@nirvanaa26',
    ipHashSalt: process.env.IP_HASH_SALT || 'amol_qr_salt_secure_2026',
    rateLimitPerMin: parseInt(process.env.RATE_LIMIT_PER_MIN || '12', 10),
    rateLimitPerDay: parseInt(process.env.RATE_LIMIT_PER_DAY || '100', 10),
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    siteUrl: (process.env.SITE_URL || 'https://amolvegresto.in').replace(/\/$/, ''),
  };

  if (isProd && !config.databaseUrl && !isVercel) {
    console.warn('[Config Warning] DATABASE_URL is not set in production. Falling back to local SQLite.');
  }

  return config;
}

export const env = getEnvConfig();
export default env;


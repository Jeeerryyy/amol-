/**
 * Amol Veg Resto - Unified Server
 * Public API, Admin API, Dynamic QR Redirects, Auth & AI Review Generator
 * Layered Architecture for Render & Vercel Deployments
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { runMigrations } from './db/migrations.js';
import { seedDatabase } from './db/seed.js';
import { checkDbHealth, closeDb } from './db/connection.js';
import appRouter from './routes/index.js';

const app = express();
app.set('trust proxy', 1);

// Track startup DB readiness to eliminate cold-start race conditions and retry cleanly after transient failures
let dbInitComplete = false;
let dbReadyPromise = startDatabaseInit();

function startDatabaseInit() {
  return initDatabase()
    .then(() => {
      dbInitComplete = true;
    })
    .catch((err) => {
      dbInitComplete = false;
      dbReadyPromise = null;
      console.error('[Initialization Error] Database setup failed:', err.message);
    });
}

async function ensureDbReady(req, res, next) {
  if (!dbInitComplete) {
    if (!dbReadyPromise) {
      dbReadyPromise = startDatabaseInit();
    }
    try {
      await dbReadyPromise;
    } catch {
      // Individual routes/health handlers report degraded DB cleanly
    }
  }
  next();
}

// 1. Response Compression (Gzip / Deflate for payload speedup)
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

// 2. Security Headers (OWASP A5: CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(securityHeaders);

// 2. Cross-Origin Resource Sharing (CORS) Configuration
const siteWwwOrigin = env.siteUrl.includes('://www.')
  ? env.siteUrl.replace('://www.', '://')
  : env.siteUrl.replace('://', '://www.');

const allowedOriginsList = [
  ...env.allowedOrigin
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
  env.siteUrl,
  siteWwwOrigin,
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
    : []),
];

app.use(
  cors((req, callback) => {
    const origin = req.headers.origin;
    if (!origin) return callback(null, { origin: true, credentials: true });
    const cleanOrigin = origin.replace(/\/$/, '');
    const reqHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
      .split(',')[0]
      .trim();
    let isSameHostOrigin = false;
    if (reqHost) {
      try {
        isSameHostOrigin = new URL(cleanOrigin).host === reqHost;
      } catch {
        isSameHostOrigin = false;
      }
    }
    const isLocalDevOrigin =
      !env.isProd &&
      /^http:\/\/(localhost|127\.0\.0\.1):(3000|3001|4173|5173)$/.test(cleanOrigin);

    if (allowedOriginsList.includes(cleanOrigin) || isSameHostOrigin || isLocalDevOrigin) {
      callback(null, { origin: true, credentials: true });
    } else {
      callback(new Error('Blocked by CORS policy: ' + origin));
    }
  })
);

// 3. Parsers & Request Limiters
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Enhanced Health Check Endpoint
app.get('/api/health', ensureDbReady, async (req, res) => {
  const isDbHealthy = await checkDbHealth();
  const status = isDbHealthy ? 'ok' : 'degraded';
  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    service: 'amol-veg-resto-unified-api',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbHealthy ? 'connected' : 'disconnected',
    environment: env.isProd ? 'production' : 'development',
  });
});

// 5. High-Performance Static Asset Serving (Skipped on Vercel where Edge CDN serves dist/ & public/)
const distPath = path.resolve('dist');
if (!env.isVercel && fs.existsSync(distPath)) {
  app.use(
    '/assets',
    express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );
  app.use(
    express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      },
    })
  );
}

const publicPath = path.resolve('public');
if (!env.isVercel && fs.existsSync(publicPath)) {
  app.use(
    express.static(publicPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (filePath.match(/\.(png|jpg|jpeg|webp|svg|ico|mp4)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        }
      },
    })
  );
}

// 6. Ensure DB initialization before API/redirect routes and mount Core Application Router
app.use(ensureDbReady);
app.use(appRouter);

// 7. Fallback SPA Routing for Render / Container Mode
if (!env.isVercel && fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (
      req.method !== 'GET' ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/q/') ||
      req.path.startsWith('/qr/') ||
      req.path === '/q' ||
      req.path === '/qr'
    ) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.sendFile(indexPath);
    }
    next();
  });
}

// 8. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 9. Auto-run database migrations and seed on startup (awaited via dbReadyPromise)
async function initDatabase() {
  await runMigrations();
  await seedDatabase();
}

// 8. Server Lifecycle & Graceful Shutdown (Render / Container friendly)
let server = null;
if (!env.isVercel && process.env.DISABLE_AUTO_LISTEN !== '1') {
  server = app.listen(env.port, () => {
    console.log(`[Server] Unified Backend listening on port ${env.port} (env: ${env.isProd ? 'prod' : 'dev'})`);
  });

  const handleShutdown = async (signal) => {
    console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
    if (server) {
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        try {
          await closeDb();
        } catch (dbErr) {
          console.error('[Server] Error closing database:', dbErr);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export { dbReadyPromise };
export default app;

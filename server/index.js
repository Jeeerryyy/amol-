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
const allowedOriginsList = env.allowedOrigin
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOriginsList.includes(cleanOrigin) ||
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin === 'http://localhost:3000' ||
        cleanOrigin === 'http://localhost:3001' ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: ' + origin));
      }
    },
    credentials: true,
  })
);

// 3. Parsers & Request Limiters
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Enhanced Health Check Endpoint
app.get('/api/health', async (req, res) => {
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

// 5. High-Performance Static Asset Serving (Immutable for hashed assets, stale-while-revalidate for media)
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
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
if (fs.existsSync(publicPath)) {
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

// 6. Mount Core Application Router
app.use(appRouter);

// 7. Fallback SPA Routing for Render / Container Mode
if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/q/')) {
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

// 9. Auto-run database migrations and seed on startup
async function initDatabase() {
  try {
    await runMigrations();
    await seedDatabase();
  } catch (err) {
    console.error('[Initialization Error] Database migration/seed failed:', err);
  }
}

initDatabase();

// 8. Server Lifecycle & Graceful Shutdown (Render / Container friendly)
let server = null;
if (!env.isVercel) {
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

export default app;

/**
 * Amol Veg Resto - Unified Server
 * Public API, Admin API, Dynamic QR Redirects, Auth & AI Review Generator
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { REVIEW_CONFIG } from '../review.config.js';
import { streamReview, postProcessReviewText } from './aiClient.js';
import { query } from './db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes, { invalidatePublicCache } from './routes/publicRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// Rate limits from environment for AI review endpoint
const RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN || '12', 10);
const RATE_LIMIT_PER_DAY = parseInt(process.env.RATE_LIMIT_PER_DAY || '100', 10);

const ipLimiterMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  let record = ipLimiterMap.get(ip);

  if (!record) {
    record = { minuteHits: [], dayHits: [] };
    ipLimiterMap.set(ip, record);
  }

  const oneMinAgo = now - 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  record.minuteHits = record.minuteHits.filter((t) => t > oneMinAgo);
  record.dayHits = record.dayHits.filter((t) => t > oneDayAgo);

  if (record.minuteHits.length >= RATE_LIMIT_PER_MIN) {
    return { allowed: false, error: 'Rate limit exceeded (minute). Please wait a moment.' };
  }

  if (record.dayHits.length >= RATE_LIMIT_PER_DAY) {
    return { allowed: false, error: 'Daily review limit reached for this IP.' };
  }

  record.minuteHits.push(now);
  record.dayHits.push(now);
  return { allowed: true };
}

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Admin Content Security Policy
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com; connect-src 'self' https://api.cloudinary.com https://generativelanguage.googleapis.com; media-src 'self' blob: https://res.cloudinary.com https://videos.pexels.com;"
    );
  }
  next();
});

// Robots.txt Route (Disallowing /admin and /special-menu)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/
Disallow: /special-menu
Disallow: /special-menu/
Disallow: /review
Disallow: /review/
Allow: /
Allow: /menu
Allow: /menu/
`);
});

// Enable CORS: allow configured origins, localhost, and all *.vercel.app deployments
const allowedOriginsList = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
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
        callback(new Error('Blocked by CORS: ' + origin));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Invalidate public cache on admin mutations
app.use('/api/admin', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    invalidatePublicCache();
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePublicCache();
      }
    });
  }
  next();
});

// Mount Public, Auth, and Admin routes
app.use('/', publicRoutes); // Handles /q/:code and /api/public/*
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);

/**
 * POST /api/generate-review
 * SSE Streaming, Validates request strictly against DB or config options.
 */
app.post('/api/generate-review', async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

  // 1. Rate limiting check
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.error });
  }

  // 2. Body Validation
  const { stars, options, selectedIds, seed, previousReview } = req.body || {};
  const optionsArray = Array.isArray(options) ? options : (Array.isArray(selectedIds) ? selectedIds : null);

  const parsedStars = parseInt(stars, 10);
  if (isNaN(parsedStars) || parsedStars < 1 || parsedStars > 5) {
    return res.status(400).json({ error: 'Invalid stars: must be an integer between 1 and 5' });
  }

  if (!optionsArray || optionsArray.length > 14) {
    return res.status(400).json({ error: 'Invalid options: must be an array of at most 14 items' });
  }

  // Fetch valid options from DB with fallback to REVIEW_CONFIG.OPTIONS
  let validOptionsList = [];
  try {
    const dbOptions = await query('SELECT id, label, ai_hint FROM review_options WHERE is_visible = 1');
    if (dbOptions && dbOptions.length > 0) {
      validOptionsList = dbOptions;
    } else {
      validOptionsList = REVIEW_CONFIG.OPTIONS;
    }
  } catch {
    validOptionsList = REVIEW_CONFIG.OPTIONS;
  }

  const validOptionMap = new Map(validOptionsList.map((o) => [o.id, o]));

  for (const opt of optionsArray) {
    if (typeof opt !== 'string' || !validOptionMap.has(opt)) {
      return res.status(400).json({ error: `Unknown option ID: ${opt}` });
    }
  }

  const parsedSeed = typeof seed === 'number' ? seed : parseInt(seed, 10);
  if (isNaN(parsedSeed)) {
    return res.status(400).json({ error: 'Invalid seed: must be a number' });
  }

  let cleanPrevReview = undefined;
  if (previousReview !== undefined && previousReview !== null) {
    if (typeof previousReview !== 'string') {
      return res.status(400).json({ error: 'previousReview must be a string' });
    }
    cleanPrevReview = previousReview.slice(0, 400);
  }

  // Map options to human labels and extra AI hints for the prompt
  const optionLabels = optionsArray.map((id) => {
    const found = validOptionMap.get(id);
    if (!found) return id;
    if (found.ai_hint) {
      return `${found.label} (${found.ai_hint})`;
    }
    return found.label;
  });

  // 3. Prepare Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  let rawAccumulated = '';

  try {
    await streamReview({
      stars: parsedStars,
      optionLabels,
      seed: parsedSeed,
      previousReview: cleanPrevReview,
      signal: abortController.signal,
      onToken: (token) => {
        rawAccumulated += token;
        res.write(`data: ${JSON.stringify({ delta: token, text: token })}\n\n`);
      },
    });

    const processed = postProcessReviewText(rawAccumulated);

    if (!processed) {
      res.write(`data: ${JSON.stringify({ error: 'Empty output from model' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ done: true, fullText: processed })}\n\n`);
      res.write(`data: [DONE]\n\n`);
    }
  } catch (err) {
    if (!abortController.signal.aborted) {
      res.write(`data: ${JSON.stringify({ error: 'AI generation error' })}\n\n`);
    }
  } finally {
    res.end();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'amol-veg-resto-unified-api' });
});

// Auto-seed database on server start
seedDatabase().catch((err) => console.error('[Server Seed Error]', err));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Unified Backend running on http://localhost:${PORT}`);
  });
}

export default app;

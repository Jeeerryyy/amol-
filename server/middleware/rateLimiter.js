import { query } from '../db/connection.js';
import { env } from '../config/env.js';
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_WINDOW_MS, RATE_LIMITS } from '../config/constants.js';

// Fallback in-memory map in case DB is temporarily unreachable or for high throughput
const memoryLoginFailures = new Map();
const memoryAiHits = new Map();
const memoryQrHits = new Map();

/**
 * Check if a login attempt is allowed based on IP and email.
 * Uses DB-backed tracking for horizontal scaling across Render instances,
 * with graceful in-memory fallback.
 */
export async function checkLoginRateLimit(ip, email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const key = `${ip}:${cleanEmail}`;
  const now = Date.now();

  try {
    const rows = await query('SELECT count, first_attempt, locked_until FROM login_attempts WHERE key = $1', [key]);
    if (rows && rows.length > 0) {
      const record = rows[0];
      const lockedUntil = Number(record.locked_until || 0);
      const firstAttempt = Number(record.first_attempt || 0);

      if (lockedUntil && lockedUntil > now) {
        const remainingMinutes = Math.max(1, Math.ceil((lockedUntil - now) / 60000));
        return {
          allowed: false,
          error: `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        };
      }

      // Expire old record if outside window
      if (now - firstAttempt > LOCKOUT_WINDOW_MS && (!lockedUntil || lockedUntil <= now)) {
        await query('DELETE FROM login_attempts WHERE key = $1', [key]);
      }
    }
    return { allowed: true };
  } catch (err) {
    // Graceful fallback to in-memory map
    const record = memoryLoginFailures.get(key);
    if (record) {
      if (record.lockedUntil && record.lockedUntil > now) {
        const remainingMinutes = Math.max(1, Math.ceil((record.lockedUntil - now) / 60000));
        return {
          allowed: false,
          error: `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        };
      }
      if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
        memoryLoginFailures.delete(key);
      }
    }
    return { allowed: true };
  }
}

/**
 * Record a failed login attempt in the database with in-memory sync.
 */
export async function recordLoginFailure(ip, email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const key = `${ip}:${cleanEmail}`;
  const now = Date.now();

  // In-memory update
  let memRecord = memoryLoginFailures.get(key);
  if (!memRecord || now - memRecord.firstAttempt > LOCKOUT_WINDOW_MS) {
    memRecord = { count: 1, firstAttempt: now, lockedUntil: null };
  } else {
    memRecord.count += 1;
    if (memRecord.count >= MAX_LOGIN_ATTEMPTS) {
      memRecord.lockedUntil = now + LOCKOUT_WINDOW_MS;
      console.warn(`[Security] Login lockout triggered for IP: ${ip}, Email: ${cleanEmail}`);
    }
  }
  memoryLoginFailures.set(key, memRecord);

  // DB update
  try {
    const rows = await query('SELECT count, first_attempt FROM login_attempts WHERE key = $1', [key]);
    if (!rows || rows.length === 0) {
      await query(
        'INSERT INTO login_attempts (key, count, first_attempt, locked_until) VALUES ($1, $2, $3, $4)',
        [key, 1, now, null]
      );
    } else {
      const newCount = Number(rows[0].count) + 1;
      const lockedUntil = newCount >= MAX_LOGIN_ATTEMPTS ? now + LOCKOUT_WINDOW_MS : null;
      await query(
        'UPDATE login_attempts SET count = $1, locked_until = $2 WHERE key = $3',
        [newCount, lockedUntil, key]
      );
      if (lockedUntil) {
        console.warn(`[Security] DB Login lockout triggered for key: ${key}`);
      }
    }
  } catch (err) {
    console.error('[RateLimiter Error] Failed to persist login failure to DB:', err.message);
  }
}

/**
 * Reset login failure count after successful authentication.
 */
export async function resetLoginFailure(ip, email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const key = `${ip}:${cleanEmail}`;
  memoryLoginFailures.delete(key);

  try {
    await query('DELETE FROM login_attempts WHERE key = $1', [key]);
  } catch (err) {
    console.error('[RateLimiter Error] Failed to clear login attempts in DB:', err.message);
  }
}

/**
 * Rate limiter for AI review generation requests.
 */
export function checkAiRateLimit(ip) {
  const now = Date.now();
  let record = memoryAiHits.get(ip);

  if (!record) {
    record = { minuteHits: [], dayHits: [] };
    memoryAiHits.set(ip, record);
  }

  const oneMinAgo = now - 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  record.minuteHits = record.minuteHits.filter((t) => t > oneMinAgo);
  record.dayHits = record.dayHits.filter((t) => t > oneDayAgo);

  if (record.minuteHits.length >= env.rateLimitPerMin) {
    return { allowed: false, error: 'Rate limit exceeded (per minute). Please wait a moment.' };
  }

  if (record.dayHits.length >= env.rateLimitPerDay) {
    return { allowed: false, error: 'Daily review generation limit reached for this IP address.' };
  }

  record.minuteHits.push(now);
  record.dayHits.push(now);
  return { allowed: true };
}

/**
 * Fast rate limiter for dynamic QR code scans (/q/:code)
 */
export function checkQrRateLimit(ip) {
  const now = Date.now();
  let hits = memoryQrHits.get(ip) || [];
  hits = hits.filter((t) => now - t < 60000);

  if (hits.length >= RATE_LIMITS.QR_SCANS_PER_MIN) {
    return false;
  }

  hits.push(now);
  memoryQrHits.set(ip, hits);
  return true;
}


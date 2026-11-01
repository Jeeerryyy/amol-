import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

const SESSION_COOKIE_NAME = 'amol_admin_session';
const SESSION_TTL_DAYS = 7;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory failed attempts tracker: key is `ip:email` -> { count, lockedUntil }
const loginFailuresMap = new Map();

export function checkLoginRateLimit(ip, email) {
  const key = `${ip}:${email.toLowerCase().trim()}`;
  const now = Date.now();
  const record = loginFailuresMap.get(key);

  if (record) {
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return {
        allowed: false,
        error: `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
      };
    }
    // Expire old record after lockout window
    if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
      loginFailuresMap.delete(key);
    }
  }

  return { allowed: true };
}

export function recordLoginFailure(ip, email) {
  const key = `${ip}:${email.toLowerCase().trim()}`;
  const now = Date.now();
  let record = loginFailuresMap.get(key);

  if (!record || now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    record = { count: 1, firstAttempt: now, lockedUntil: null };
  } else {
    record.count += 1;
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_WINDOW_MS;
      console.warn(`[Security] Login lockout triggered for IP: ${ip}, Email: ${email}`);
    }
  }
  loginFailuresMap.set(key, record);
}

export function resetLoginFailure(ip, email) {
  const key = `${ip}:${email.toLowerCase().trim()}`;
  loginFailuresMap.delete(key);
}

/**
 * Generate cryptographically secure session token and CSRF token
 */
export function generateTokens() {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');
  return { sessionToken, csrfToken };
}

/**
 * Create a session in DB with 7-day rolling expiry
 */
export async function createSession(ownerId) {
  const { sessionToken, csrfToken } = generateTokens();
  const id = `sess_${crypto.randomBytes(12).toString('hex')}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Combine sessionToken and csrfToken separated by ':' in DB or store session token
  const tokenPayload = `${sessionToken}:${csrfToken}`;

  await query(
    'INSERT INTO sessions (id, owner_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
    [id, ownerId, tokenPayload, expiresAt, now]
  );

  return { sessionToken, csrfToken, expiresAt };
}

/**
 * Validate session from cookie and roll expiry
 */
export async function validateSession(rawSessionToken) {
  if (!rawSessionToken) return null;

  const now = new Date().toISOString();
  const rows = await query(
    'SELECT s.id, s.owner_id, s.token, s.expires_at, o.email FROM sessions s JOIN owner o ON s.owner_id = o.id WHERE s.expires_at > $1',
    [now]
  );

  for (const row of rows) {
    const [tokenPart, csrfPart] = (row.token || '').split(':');
    if (tokenPart === rawSessionToken) {
      // 7-day rolling expiry update
      const newExpiry = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
      await query('UPDATE sessions SET expires_at = $1 WHERE id = $2', [newExpiry, row.id]);

      return {
        sessionId: row.id,
        ownerId: row.owner_id,
        email: row.email,
        csrfToken: csrfPart,
      };
    }
  }

  return null;
}

/**
 * Destroy a session
 */
export async function destroySession(rawSessionToken) {
  if (!rawSessionToken) return;
  const rows = await query('SELECT id, token FROM sessions');
  for (const row of rows) {
    const [tokenPart] = (row.token || '').split(':');
    if (tokenPart === rawSessionToken) {
      await query('DELETE FROM sessions WHERE id = $1', [row.id]);
      break;
    }
  }
}

/**
 * Express middleware to enforce auth & CSRF on admin routes
 */
export async function requireAuth(req, res, next) {
  const rawSessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (!rawSessionToken) {
    return res.status(401).json({ error: 'Authentication required. No session cookie.' });
  }

  const session = await validateSession(rawSessionToken);
  if (!session) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.owner = { id: session.ownerId, email: session.email };
  req.csrfToken = session.csrfToken;

  // CSRF validation on all state-changing mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const clientCsrf = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!clientCsrf || clientCsrf !== session.csrfToken) {
      return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
  }

  next();
}

export { SESSION_COOKIE_NAME, SESSION_TTL_DAYS };


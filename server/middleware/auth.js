import crypto from 'crypto';
import { query } from '../db/connection.js';
import { env } from '../config/env.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from '../config/constants.js';

/**
 * Compute session cookie flags that support both same-origin deployments (Vercel monolith)
 * and cross-origin HTTPS deployments (Vercel frontend + Render backend).
 */
export function getSessionCookieOptions(req, includeMaxAge = true) {
  const reqOrigin = req?.headers?.origin;
  const reqHost = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim()
    .split(':')[0];
  let isCrossSite = false;
  if (reqOrigin && reqHost) {
    try {
      isCrossSite = new URL(reqOrigin).hostname !== reqHost;
    } catch {
      isCrossSite = false;
    }
  }
  const isHttps = Boolean(
    env.isProd ||
    req?.secure ||
    String(req?.headers?.['x-forwarded-proto'] || '').includes('https')
  );
  const useNone = isCrossSite && isHttps;
  const options = {
    httpOnly: true,
    secure: isHttps,
    sameSite: useNone ? 'none' : 'lax',
    path: '/',
  };
  if (includeMaxAge) {
    options.maxAge = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  }
  return options;
}

const memorySessions = new Map();

/**
 * Generate cryptographically secure session token (256-bit entropy) and CSRF token (192-bit entropy)
 */
export function generateTokens() {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');
  return { sessionToken, csrfToken };
}

const SESSION_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

/**
 * Validate session token format (64 lowercase/uppercase hex chars)
 */
function isValidSessionTokenFormat(token) {
  return typeof token === 'string' && SESSION_TOKEN_REGEX.test(token);
}

/**
 * Timing-safe string equality comparison to prevent timing attacks
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Create a session in DB with 7-day rolling expiry, falling back gracefully to memory
 */
export async function createSession(ownerId, ownerEmail = 'owner@amolvegresto.in') {
  const { sessionToken, csrfToken } = generateTokens();
  const id = `sess_${crypto.randomBytes(12).toString('hex')}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Combine sessionToken:csrfToken for indexed lookup
  const tokenPayload = `${sessionToken}:${csrfToken}`;

  memorySessions.set(sessionToken, {
    sessionId: id,
    ownerId,
    email: ownerEmail,
    csrfToken,
    expiresAt,
  });

  try {
    await query(
      'INSERT INTO sessions (id, owner_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
      [id, ownerId, tokenPayload, expiresAt, now]
    );
  } catch (err) {
    console.warn('[Session] Database offline, cached session in memory:', err.message);
  }

  return { sessionToken, csrfToken, expiresAt };
}

/**
 * Validate session from cookie with exact prefix lookup (no LIKE wildcard injection)
 * Extends session with rolling 7-day TTL, fallback to memory only when DB is offline
 */
export async function validateSession(rawSessionToken) {
  if (!isValidSessionTokenFormat(rawSessionToken)) return null;

  try {
    const now = new Date().toISOString();
    const rows = await query(
      "SELECT s.id, s.owner_id, s.token, s.expires_at, o.email FROM sessions s JOIN owner o ON s.owner_id = o.id WHERE SUBSTR(s.token, 1, 64) = $1 AND SUBSTR(s.token, 65, 1) = ':' AND s.expires_at > $2 LIMIT 1",
      [rawSessionToken, now]
    );

    if (rows && rows.length > 0) {
      const row = rows[0];
      const [tokenPart, csrfPart] = (row.token || '').split(':');
      if (safeEqual(tokenPart, rawSessionToken)) {
        // 7-day rolling expiry update
        const newExpiry = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
        await query('UPDATE sessions SET expires_at = $1 WHERE id = $2', [newExpiry, row.id]).catch(() => {});

        return {
          sessionId: row.id,
          ownerId: row.owner_id,
          email: row.email,
          csrfToken: csrfPart,
        };
      }
    }
    return null;
  } catch (err) {
    // Database unreachable, fall back to memory store
    const mem = memorySessions.get(rawSessionToken);
    if (mem) {
      if (new Date(mem.expiresAt).getTime() <= Date.now()) {
        memorySessions.delete(rawSessionToken);
        return null;
      }
      return {
        sessionId: mem.sessionId,
        ownerId: mem.ownerId,
        email: mem.email,
        csrfToken: mem.csrfToken,
      };
    }
    return null;
  }
}

/**
 * Destroy a session atomically (strict token validation prevents wildcard wipe)
 */
export async function destroySession(rawSessionToken) {
  if (!isValidSessionTokenFormat(rawSessionToken)) return;
  memorySessions.delete(rawSessionToken);
  try {
    await query("DELETE FROM sessions WHERE SUBSTR(token, 1, 64) = $1 AND SUBSTR(token, 65, 1) = ':'", [rawSessionToken]);
  } catch (err) {
    // Ignore offline error
  }
}

/**
 * Invalidate all other sessions for an owner (e.g., on password/credential change)
 */
export async function destroyOtherSessions(ownerId, keepSessionToken) {
  for (const [token, session] of memorySessions.entries()) {
    if (session.ownerId === ownerId && token !== keepSessionToken) {
      memorySessions.delete(token);
    }
  }
  try {
    if (isValidSessionTokenFormat(keepSessionToken)) {
      await query(
        "DELETE FROM sessions WHERE owner_id = $1 AND NOT (SUBSTR(token, 1, 64) = $2 AND SUBSTR(token, 65, 1) = ':')",
        [ownerId, keepSessionToken]
      );
    } else {
      await query('DELETE FROM sessions WHERE owner_id = $1', [ownerId]);
    }
  } catch (err) {
    // Ignore offline error
  }
}

/**
 * Keep in-memory session email metadata in sync after account update
 */
export function updateSessionEmail(rawSessionToken, newEmail) {
  if (!isValidSessionTokenFormat(rawSessionToken)) return;
  const mem = memorySessions.get(rawSessionToken);
  if (mem) {
    mem.email = newEmail;
  }
}

/**
 * Express middleware to enforce server-side auth & CSRF on protected admin routes (OWASP A1 & A7)
 */
export async function requireAuth(req, res, next) {
  const rawSessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (!rawSessionToken) {
    return res.status(401).json({ error: 'Authentication required. No session cookie.' });
  }

  const session = await validateSession(rawSessionToken);
  if (!session) {
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(req, false));
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.owner = { id: session.ownerId, email: session.email };
  req.csrfToken = session.csrfToken;

  // Enforce CSRF on all state-changing mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const clientCsrf = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!clientCsrf || !safeEqual(clientCsrf, session.csrfToken)) {
      return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
  }

  next();
}

export default requireAuth;


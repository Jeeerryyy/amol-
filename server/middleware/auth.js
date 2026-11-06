import crypto from 'crypto';
import { query } from '../db/connection.js';
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from '../config/constants.js';

/**
 * Generate cryptographically secure session token (256-bit entropy) and CSRF token (192-bit entropy)
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

  // Combine sessionToken:csrfToken for indexed lookup
  const tokenPayload = `${sessionToken}:${csrfToken}`;

  await query(
    'INSERT INTO sessions (id, owner_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
    [id, ownerId, tokenPayload, expiresAt, now]
  );

  return { sessionToken, csrfToken, expiresAt };
}

/**
 * Validate session from cookie with direct index lookup (O(1) database query)
 * Extends session with rolling 7-day TTL
 */
export async function validateSession(rawSessionToken) {
  if (!rawSessionToken || typeof rawSessionToken !== 'string') return null;

  const now = new Date().toISOString();
  const rows = await query(
    'SELECT s.id, s.owner_id, s.token, s.expires_at, o.email FROM sessions s JOIN owner o ON s.owner_id = o.id WHERE s.token LIKE $1 || \':%\' AND s.expires_at > $2 LIMIT 1',
    [rawSessionToken, now]
  );

  if (!rows || rows.length === 0) return null;

  const row = rows[0];
  const [tokenPart, csrfPart] = (row.token || '').split(':');
  if (tokenPart !== rawSessionToken) return null;

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

/**
 * Destroy a session atomically
 */
export async function destroySession(rawSessionToken) {
  if (!rawSessionToken || typeof rawSessionToken !== 'string') return;
  await query('DELETE FROM sessions WHERE token LIKE $1 || \':%\'', [rawSessionToken]);
}

/**
 * Timing-safe string equality comparison to prevent timing attacks on CSRF tokens
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
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
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
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

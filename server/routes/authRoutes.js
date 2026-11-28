import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/connection.js';
import {
  createSession,
  destroySession,
  destroyOtherSessions,
  updateSessionEmail,
  requireAuth,
  getSessionCookieOptions,
} from '../middleware/auth.js';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginFailure,
} from '../middleware/rateLimiter.js';
import { SESSION_COOKIE_NAME } from '../config/constants.js';
import { loginSchema, changeCredentialsSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * POST /api/admin/auth/login or /api/admin/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body.' });
      }
    }

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues?.[0]?.message || 'Invalid input format' });
    }

    const { email, password } = parseResult.data;

    // Rate limiting check (DB-backed + memory fallback)
    const rateLimitCheck = await checkLoginRateLimit(clientIp, email);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ error: rateLimitCheck.error });
    }

    let owners = [];
    try {
      owners = await query('SELECT id, email, password_hash FROM owner WHERE LOWER(email) = LOWER($1)', [email]);
    } catch (dbErr) {
      console.error('[Auth] Database error during login lookup:', dbErr.message);
      return res.status(503).json({ error: 'Authentication service temporarily unavailable. Please try again shortly.' });
    }

    if (owners.length === 0) {
      await recordLoginFailure(clientIp, email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const owner = owners[0];
    const isMatch = await bcrypt.compare(password, owner.password_hash);
    if (!isMatch) {
      await recordLoginFailure(clientIp, email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Login successful
    await resetLoginFailure(clientIp, email);
    const session = await createSession(owner.id, owner.email);

    // Set httpOnly session cookie (supports same-origin and cross-site HTTPS deployments)
    res.cookie(SESSION_COOKIE_NAME, session.sessionToken, getSessionCookieOptions(req, true));

    return res.json({
      success: true,
      email: owner.email,
      csrfToken: session.csrfToken,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/logout
 */
router.post('/logout', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (rawToken) {
      await destroySession(rawToken);
    }
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(req, false));
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    authenticated: true,
    email: req.owner.email,
    csrfToken: req.csrfToken,
  });
});

/**
 * Shared handler for credential updates
 * Supports PUT /credentials, PUT /auth/credentials, POST /change-account
 */
async function handleCredentialsUpdate(req, res, next) {
  try {
    const rawPayload = {
      currentPassword: req.body?.currentPassword ?? req.body?.current_password,
      newEmail: req.body?.newEmail ?? req.body?.email ?? undefined,
      newPassword: req.body?.newPassword ?? req.body?.new_password ?? undefined,
    };
    if (rawPayload.newEmail === '') delete rawPayload.newEmail;
    if (rawPayload.newPassword === '') delete rawPayload.newPassword;

    const parsed = changeCredentialsSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || 'Invalid credential input.' });
    }

    const { currentPassword, newEmail, newPassword } = parsed.data;
    if (!newEmail && !newPassword) {
      return res.status(400).json({ error: 'Provide a new email address or a new password to update.' });
    }

    const owners = await query('SELECT id, email, password_hash FROM owner WHERE id = $1', [req.owner.id]);
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner account not found' });
    }

    const owner = owners[0];
    const isMatch = await bcrypt.compare(currentPassword, owner.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const now = new Date().toISOString();
    let updatedEmail = owner.email;
    let updatedHash = owner.password_hash;

    if (newEmail && newEmail.toLowerCase() !== owner.email.toLowerCase()) {
      updatedEmail = newEmail.toLowerCase().trim();
    }

    let passwordUpdated = false;
    if (newPassword) {
      updatedHash = await bcrypt.hash(newPassword, 12);
      passwordUpdated = true;
    }

    await query(
      'UPDATE owner SET email = $1, password_hash = $2, updated_at = $3 WHERE id = $4',
      [updatedEmail, updatedHash, now, owner.id]
    );

    const currentToken = req.cookies?.[SESSION_COOKIE_NAME];
    updateSessionEmail(currentToken, updatedEmail);
    if (passwordUpdated) {
      await destroyOtherSessions(owner.id, currentToken);
    }

    return res.json({
      success: true,
      email: updatedEmail,
      message: 'Account credentials updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

router.put('/credentials', requireAuth, handleCredentialsUpdate);
router.put('/auth/credentials', requireAuth, handleCredentialsUpdate);
router.post('/change-account', requireAuth, handleCredentialsUpdate);

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db.js';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginFailure,
  createSession,
  destroySession,
  requireAuth,
  SESSION_COOKIE_NAME,
} from '../auth.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/admin/login
 */
router.post('/login', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
  }

  const { email, password } = parseResult.data;

  // Rate limiting check
  const rateLimitCheck = checkLoginRateLimit(clientIp, email);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({ error: rateLimitCheck.error });
  }

  const owners = await query('SELECT id, email, password_hash FROM owner WHERE LOWER(email) = LOWER($1)', [email]);
  if (owners.length === 0) {
    recordLoginFailure(clientIp, email);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const owner = owners[0];
  const isMatch = await bcrypt.compare(password, owner.password_hash);
  if (!isMatch) {
    recordLoginFailure(clientIp, email);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Login successful
  resetLoginFailure(clientIp, email);
  const session = await createSession(owner.id);

  // Set httpOnly, Secure, SameSite=Strict cookie with 7-day rolling expiry
  res.cookie(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.json({
    success: true,
    email: owner.email,
    csrfToken: session.csrfToken,
  });
});

/**
 * POST /api/admin/logout
 */
router.post('/logout', async (req, res) => {
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (rawToken) {
    await destroySession(rawToken);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
});

/**
 * GET /api/admin/me
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
async function handleCredentialsUpdate(req, res) {
  const currentPassword = req.body.currentPassword || req.body.current_password;
  const newEmail = req.body.newEmail || req.body.email;
  const newPassword = req.body.newPassword || req.body.new_password;

  if (!currentPassword) {
    return res.status(400).json({ error: 'Current password is required.' });
  }

  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
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

  if (newPassword) {
    updatedHash = await bcrypt.hash(newPassword, 12);
  }

  await query(
    'UPDATE owner SET email = $1, password_hash = $2, updated_at = $3 WHERE id = $4',
    [updatedEmail, updatedHash, now, owner.id]
  );

  return res.json({
    success: true,
    email: updatedEmail,
    message: 'Account credentials updated successfully.',
  });
}

router.put('/credentials', requireAuth, handleCredentialsUpdate);
router.put('/auth/credentials', requireAuth, handleCredentialsUpdate);
router.post('/change-account', requireAuth, handleCredentialsUpdate);

export default router;

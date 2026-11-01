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

const changeAccountSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail: z.string().email().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
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
 * POST /api/admin/change-account
 */
router.post('/change-account', requireAuth, async (req, res) => {
  const parseResult = changeAccountSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
  }

  const { currentPassword, newEmail, newPassword } = parseResult.data;

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
});

export default router;

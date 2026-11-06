#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { query } from '../server/db/connection.js';

async function resetPassword() {
  const newPassword = process.argv[2];

  if (!newPassword || newPassword.length < 6) {
    console.error('Usage: node scripts/reset-password.js <new_password>');
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  const owners = await query('SELECT id, email FROM owner LIMIT 1');
  if (owners.length === 0) {
    console.error('No owner account found. Please run seed script first: node server/seed.js');
    process.exit(1);
  }

  const owner = owners[0];
  const hash = await bcrypt.hash(newPassword, 12);
  const now = new Date().toISOString();

  await query('UPDATE owner SET password_hash = $1, updated_at = $2 WHERE id = $3', [hash, now, owner.id]);
  // Invalidate all existing sessions for security
  await query('DELETE FROM sessions WHERE owner_id = $1', [owner.id]);

  console.log(`[Success] Owner password reset successfully for ${owner.email}. All active sessions invalidated.`);
  process.exit(0);
}

resetPassword().catch((err) => {
  console.error('[Error] Failed to reset password:', err);
  process.exit(1);
});


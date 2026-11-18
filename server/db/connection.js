import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isPostgres = Boolean(
  env.databaseUrl && (env.databaseUrl.startsWith('postgres://') || env.databaseUrl.startsWith('postgresql://'))
);

let pgPool = null;
let sqliteDb = null;

function getSqliteDb() {
  if (!sqliteDb) {
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'restaurant.db');
    sqliteDb = new DatabaseSync(dbPath);
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    console.log('[DB] Connected to local SQLite database at:', dbPath);
  }
  return sqliteDb;
}

if (isPostgres) {
  try {
    const { default: pg } = await import('pg');
    pgPool = new pg.Pool({
      connectionString: env.databaseUrl,
      ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    pgPool.on('error', (err) => {
      console.error('[DB Pool Error]', err.message);
    });

    // Fast connectivity probe (3s timeout) to prevent blocking or crashes
    const probePromise = pgPool.query('SELECT 1 as ping');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PostgreSQL connection timeout (3s)')), 3000)
    );
    await Promise.race([probePromise, timeoutPromise]);
    console.log('[DB] Connected to PostgreSQL managed database');
  } catch (err) {
    console.warn(`[DB Warning] Failed to connect to PostgreSQL (${err.message}). Automatically falling back to local SQLite database.`);
    isPostgres = false;
    if (pgPool) {
      try {
        await pgPool.end();
      } catch {}
      pgPool = null;
    }
    getSqliteDb();
  }
} else {
  getSqliteDb();
}

/**
 * Universal query runner: translates placeholders safely between PostgreSQL ($1, $2) and SQLite (?)
 * Seamlessly falls back to SQLite if PostgreSQL encounters connection loss.
 */
export async function query(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.warn(`[DB Query Fallback] PostgreSQL unavailable (${err.code}). Falling back to local SQLite.`);
        isPostgres = false;
        return query(sql, params);
      }
      throw err;
    }
  } else {
    const db = getSqliteDb();
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(sqliteSql);
    if (/^\s*(SELECT|PRAGMA|WITH)/i.test(sqliteSql)) {
      return stmt.all(...params);
    } else {
      const info = stmt.run(...params);
      return [{ changes: info.changes, lastInsertRowid: info.lastInsertRowid }];
    }
  }
}

/**
 * Execute multiple DDL statements without parameterization
 */
export async function exec(sql) {
  if (isPostgres && pgPool) {
    try {
      await pgPool.query(sql);
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.warn(`[DB Exec Fallback] PostgreSQL unavailable (${err.code}). Executing on SQLite.`);
        isPostgres = false;
        getSqliteDb().exec(sql);
        return;
      }
      throw err;
    }
  } else {
    getSqliteDb().exec(sql);
  }
}

/**
 * Health check helper: verifies that the database responds to a simple ping query
 */
export async function checkDbHealth() {
  try {
    const res = await query('SELECT 1 as ping');
    return res && res.length > 0;
  } catch (err) {
    console.error('[DB Health Check Failed]', err);
    return false;
  }
}

/**
 * Close database connections cleanly during graceful shutdown
 */
export async function closeDb() {
  if (pgPool) {
    try {
      await pgPool.end();
      console.log('[DB] PostgreSQL pool closed cleanly.');
    } catch (e) {
      console.error('[DB] Error closing PG pool:', e);
    }
  }
  if (sqliteDb) {
    try {
      sqliteDb.close();
      console.log('[DB] SQLite connection closed.');
    } catch (e) {
      console.error('[DB] Error closing SQLite:', e);
    }
  }
}

export const db = {
  query,
  exec,
  isPostgres: () => isPostgres,
  checkDbHealth,
  closeDb,
};

export default db;

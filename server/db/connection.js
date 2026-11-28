import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasPostgresUrl = Boolean(
  env.databaseUrl && (env.databaseUrl.startsWith('postgres://') || env.databaseUrl.startsWith('postgresql://'))
);

export let isPostgres = hasPostgresUrl;

let pgPool = null;
let sqliteDb = null;
let connectionInitPromise = null;

const TRANSIENT_PG_CODES = new Set(['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', '57P01']);

function resolveSqliteDbPath() {
  if (process.env.SQLITE_DB_PATH) {
    return path.resolve(process.env.SQLITE_DB_PATH);
  }
  if (env.isVercel) {
    return path.join(os.tmpdir(), 'amol-restaurant.db');
  }
  return path.resolve(__dirname, '../../data/restaurant.db');
}

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    const modErr = new Error(
      'Database runtime unavailable: configure PostgreSQL DATABASE_URL or use Node.js 22+ with node:sqlite.'
    );
    modErr.statusCode = 503;
    throw modErr;
  }

  const dbPath = resolveSqliteDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new DatabaseSync(dbPath);
  try {
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
  } catch {
    try {
      sqliteDb.exec('PRAGMA journal_mode = DELETE;');
    } catch {
      // Ignore pragma fallback error on restricted filesystems
    }
  }
  sqliteDb.exec('PRAGMA busy_timeout = 5000;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  console.log('[DB] Connected to local SQLite database at:', dbPath);
  return sqliteDb;
}

async function initConnection() {
  if (hasPostgresUrl) {
    try {
      const { default: pg } = await import('pg');
      pgPool = new pg.Pool({
        connectionString: env.databaseUrl,
        ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
        max: env.isVercel ? 5 : 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        allowExitOnIdle: env.isVercel,
      });

      pgPool.on('error', (err) => {
        console.error('[DB Pool Error]', err.message);
      });

      const probePromise = pgPool.query('SELECT 1 as ping');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PostgreSQL connection timeout (10s)')), 10000)
      );
      await Promise.race([probePromise, timeoutPromise]);
      isPostgres = true;
      console.log('[DB] Connected to PostgreSQL managed database');
      return;
    } catch (err) {
      console.warn(`[DB Warning] Failed to connect to PostgreSQL (${err.message}).`);
      if (pgPool) {
        try {
          await pgPool.end();
        } catch { }
        pgPool = null;
      }
      if (env.isVercel) {
        const pgErr = new Error('Primary database connection unavailable. Please verify DATABASE_URL and database status.');
        pgErr.statusCode = 503;
        throw pgErr;
      }
      console.warn('[DB Warning] Automatically falling back to local SQLite database.');
      isPostgres = false;
    }
  } else {
    isPostgres = false;
    if (env.isVercel) {
      console.warn('[DB Warning] DATABASE_URL not configured on Vercel; using ephemeral /tmp SQLite storage.');
    }
  }

  await getSqliteDb();
}

export async function ensureConnectionReady() {
  if (!connectionInitPromise) {
    connectionInitPromise = initConnection().catch((err) => {
      connectionInitPromise = null;
      throw err;
    });
  }
  return connectionInitPromise;
}

/**
 * Translate PostgreSQL positional parameters ($1, $2, reused $1) to SQLite '?' placeholders
 * cleanly while ignoring single-quoted string literals.
 */
export function translateSqlToSqlite(sql, params = []) {
  let out = '';
  const expandedParams = [];
  let hasDollarParams = false;
  let inSingleQuote = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'") {
      if (inSingleQuote && sql[i + 1] === "'") {
        out += "''";
        i++;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      out += ch;
      continue;
    }

    if (!inSingleQuote && ch === '$' && i + 1 < sql.length && sql[i + 1] >= '1' && sql[i + 1] <= '9') {
      let j = i + 1;
      while (j < sql.length && sql[j] >= '0' && sql[j] <= '9') j++;
      const idx = Number(sql.slice(i + 1, j)) - 1;
      if (idx >= params.length) {
        throw new Error(`Missing SQL parameter $${idx + 1}`);
      }
      hasDollarParams = true;
      expandedParams.push(params[idx]);
      out += '?';
      i = j - 1;
      continue;
    }

    out += ch;
  }

  return {
    sqliteSql: out,
    sqliteParams: hasDollarParams ? expandedParams : params,
  };
}

function isTransientPgError(err) {
  return Boolean(
    err &&
    (TRANSIENT_PG_CODES.has(err.code) || /connection terminated|timeout expired/i.test(err.message || ''))
  );
}

/**
 * Universal query runner: translates placeholders safely between PostgreSQL ($1, $2) and SQLite (?)
 * Seamlessly retries transient PG blips and falls back locally when PostgreSQL is offline.
 */
export async function query(sql, params = []) {
  await ensureConnectionReady();

  if (isPostgres && pgPool) {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    try {
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      if (isTransientPgError(err)) {
        try {
          const retryRes = await pgPool.query(pgSql, params);
          return retryRes.rows;
        } catch (retryErr) {
          if (!env.isVercel && !hasPostgresUrl) {
            isPostgres = false;
            return query(sql, params);
          }
          if (!env.isVercel && TRANSIENT_PG_CODES.has(retryErr.code)) {
            console.warn(`[DB Query Fallback] PostgreSQL unavailable (${retryErr.code}). Falling back to local SQLite.`);
            isPostgres = false;
            return query(sql, params);
          }
          throw retryErr;
        }
      }
      throw err;
    }
  } else {
    const db = await getSqliteDb();
    const { sqliteSql, sqliteParams } = translateSqlToSqlite(sql, params);
    const stmt = db.prepare(sqliteSql);
    if (/^\s*(SELECT|PRAGMA|WITH)/i.test(sqliteSql)) {
      return stmt.all(...sqliteParams);
    } else {
      const info = stmt.run(...sqliteParams);
      return [{ changes: info.changes, lastInsertRowid: info.lastInsertRowid }];
    }
  }
}

/**
 * Execute multiple DDL statements without parameterization
 */
export async function exec(sql) {
  await ensureConnectionReady();

  if (isPostgres && pgPool) {
    try {
      await pgPool.query(sql);
    } catch (err) {
      if (isTransientPgError(err)) {
        try {
          await pgPool.query(sql);
          return;
        } catch (retryErr) {
          if (!env.isVercel && TRANSIENT_PG_CODES.has(retryErr.code)) {
            console.warn(`[DB Exec Fallback] PostgreSQL unavailable (${retryErr.code}). Executing on SQLite.`);
            isPostgres = false;
            (await getSqliteDb()).exec(sql);
            return;
          }
          throw retryErr;
        }
      }
      throw err;
    }
  } else {
    (await getSqliteDb()).exec(sql);
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
    console.error('[DB Health Check Failed]', err.message);
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
    pgPool = null;
  }
  if (sqliteDb) {
    try {
      sqliteDb.close();
      console.log('[DB] SQLite connection closed.');
    } catch (e) {
      console.error('[DB] Error closing SQLite:', e);
    }
    sqliteDb = null;
  }
  connectionInitPromise = null;
}

export const db = {
  query,
  exec,
  isPostgres: () => isPostgres,
  ensureConnectionReady,
  checkDbHealth,
  closeDb,
};

export default db;

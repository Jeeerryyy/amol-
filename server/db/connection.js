import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isPostgres = Boolean(
  env.databaseUrl && (env.databaseUrl.startsWith('postgres://') || env.databaseUrl.startsWith('postgresql://'))
);

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  const { default: pg } = await import('pg');
  pgPool = new pg.Pool({
    connectionString: env.databaseUrl,
    ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pgPool.on('error', (err) => {
    console.error('[DB Pool Error]', err);
  });

  console.log('[DB] Connected to PostgreSQL managed database');
} else {
  const { DatabaseSync } = await import('node:sqlite');
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

/**
 * Universal query runner: translates placeholders safely between PostgreSQL ($1, $2) and SQLite (?)
 */
export async function query(sql, params = []) {
  if (isPostgres) {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
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
  if (isPostgres) {
    await pgPool.query(sql);
  } else {
    sqliteDb.exec(sql);
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
    await pgPool.end();
    console.log('[DB] PostgreSQL pool closed cleanly.');
  } else if (sqliteDb) {
    sqliteDb.close();
    console.log('[DB] SQLite connection closed.');
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

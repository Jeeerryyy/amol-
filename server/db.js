import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'));

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  // Use pg for PostgreSQL
  const { default: pg } = await import('pg');
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
  console.log('[DB] Connected to PostgreSQL managed database');
} else {
  // Fallback to built-in node:sqlite
  const { DatabaseSync } = await import('node:sqlite');
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'restaurant.db');
  sqliteDb = new DatabaseSync(dbPath);
  // Enable WAL mode for high concurrency
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  console.log('[DB] Connected to local SQLite database at:', dbPath);
}

/**
 * Universal query runner: accepts standard $1, $2 or ? params
 */
export async function query(sql, params = []) {
  if (isPostgres) {
    // If query has ? placeholders, convert to $1, $2, etc.
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    // SQLite: replace $1, $2 with ?
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    // If it's a SELECT query or RETURNING query
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

export const db = {
  query,
  exec,
  isPostgres: () => isPostgres,
};

export default db;


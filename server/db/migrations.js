import { exec } from './connection.js';

export async function runMigrations() {
  console.log('[Migrations] Running database table setup & indexes...');

  const ddl = `
    CREATE TABLE IF NOT EXISTS owner (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      first_attempt BIGINT NOT NULL,
      locked_until BIGINT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      serving_note TEXT,
      price_type TEXT NOT NULL DEFAULT 'single',
      base_price REAL,
      special_price REAL,
      special_price_override REAL,
      tags TEXT,
      spice_level TEXT NOT NULL DEFAULT 'none',
      badges TEXT,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_visible INTEGER NOT NULL DEFAULT 1,
      scope TEXT NOT NULL DEFAULT 'both',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS dish_variants (
      id TEXT PRIMARY KEY,
      dish_id TEXT NOT NULL,
      label TEXT NOT NULL,
      base_price REAL NOT NULL,
      special_price REAL,
      special_price_override REAL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dish_images (
      id TEXT PRIMARY KEY,
      dish_id TEXT NOT NULL,
      public_id TEXT,
      url TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_cover INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      video_url TEXT,
      video_public_id TEXT,
      poster_url TEXT,
      poster_public_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      destination TEXT NOT NULL,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      qr_id TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      device_type TEXT NOT NULL,
      os TEXT NOT NULL,
      browser TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS popular_dishes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      image_url TEXT,
      image_public_id TEXT,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      public_id TEXT,
      alt_text TEXT NOT NULL,
      caption TEXT,
      category TEXT NOT NULL DEFAULT 'food',
      aspect TEXT NOT NULL DEFAULT 'standard',
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seo_pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      og_image_url TEXT,
      noindex INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_options (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      positive_only INTEGER NOT NULL DEFAULT 0,
      ai_hint TEXT,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      stars INTEGER,
      option_ids TEXT,
      device_type TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scans_qr_created ON scans(qr_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
    CREATE INDEX IF NOT EXISTS idx_review_events_created ON review_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_dishes_category_order ON dishes(category_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_dishes_scope_visible ON dishes(scope, is_visible);
    CREATE INDEX IF NOT EXISTS idx_dishes_category_available ON dishes(category_id, is_available, is_visible);
    CREATE INDEX IF NOT EXISTS idx_dishes_deleted_visible ON dishes(deleted_at, is_visible, sort_order);
    CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(sort_order);
    CREATE INDEX IF NOT EXISTS idx_gallery_items_visible_sort ON gallery_items(is_visible, sort_order, created_at);
    CREATE INDEX IF NOT EXISTS idx_popular_dishes_visible ON popular_dishes(is_visible, sort_order);
    CREATE INDEX IF NOT EXISTS idx_dish_images_dish ON dish_images(dish_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_dish_variants_dish ON dish_variants(dish_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `;

  await exec(ddl);
  console.log('[Migrations] Tables and indexes created successfully.');
}

export default runMigrations;


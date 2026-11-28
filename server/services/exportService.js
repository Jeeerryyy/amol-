import { query } from '../db/connection.js';

/**
 * Generate full JSON database backup of all restaurant content
 */
export async function exportContentBackup() {
  const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  const dishes = await query('SELECT * FROM dishes WHERE deleted_at IS NULL ORDER BY sort_order ASC');
  const dishVariants = await query('SELECT * FROM dish_variants ORDER BY sort_order ASC');
  const dishImages = await query('SELECT * FROM dish_images ORDER BY sort_order ASC');
  const popularDishes = await query('SELECT * FROM popular_dishes ORDER BY sort_order ASC');
  const galleryItems = await query('SELECT * FROM gallery_items ORDER BY sort_order ASC');
  const siteContent = await query('SELECT * FROM site_content');
  const legalPages = await query('SELECT * FROM legal_pages');
  const seoPages = await query('SELECT * FROM seo_pages');
  const reviewOptions = await query('SELECT * FROM review_options ORDER BY sort_order ASC');

  return {
    exportedAt: new Date().toISOString(),
    categories,
    dishes,
    dishVariants,
    dishImages,
    popularDishes,
    galleryItems,
    siteContent,
    legalPages,
    seoPages,
    reviewOptions,
  };
}

/**
 * Escape CSV cell safely (RFC 4180 + formula injection neutralization for Excel/Sheets)
 */
export function escapeCsvCell(value) {
  let str = value === null || value === undefined ? '' : String(value);
  if (/^[\t\r ]*[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Parse and validate optional ISO date query string
 */
function parseDateOrThrow(rawDate, label) {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    const err = new Error(`Invalid '${label}' date parameter.`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }
  return parsed.toISOString();
}

/**
 * Format UTC/ISO timestamp cleanly in IST (+05:30)
 */
function formatIstTimestamp(raw) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 5.5 * 3600000).toISOString().replace('Z', '+05:30');
}

/**
 * Generate CSV export of QR scans with IST timestamps
 */
export async function exportScansCsv({ from, to } = {}) {
  let sql = 'SELECT * FROM scans WHERE 1=1';
  const params = [];

  const fromIso = parseDateOrThrow(from, 'from');
  const toIso = parseDateOrThrow(to, 'to');

  if (fromIso) {
    params.push(fromIso);
    sql += ` AND created_at >= $${params.length}`;
  }
  if (toIso) {
    params.push(toIso);
    sql += ` AND created_at <= $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = await query(sql, params);

  let csv = 'id,qr_id,device_type,os,browser,created_at_ist\n';
  for (const r of rows) {
    const istTime = formatIstTimestamp(r.created_at);
    csv += [
      escapeCsvCell(r.id),
      escapeCsvCell(r.qr_id),
      escapeCsvCell(r.device_type),
      escapeCsvCell(r.os),
      escapeCsvCell(r.browser),
      escapeCsvCell(istTime),
    ].join(',') + '\n';
  }
  return csv;
}

/**
 * Generate CSV export of review events with IST timestamps
 */
export async function exportReviewsCsv({ from, to } = {}) {
  let sql = 'SELECT * FROM review_events WHERE 1=1';
  const params = [];

  const fromIso = parseDateOrThrow(from, 'from');
  const toIso = parseDateOrThrow(to, 'to');

  if (fromIso) {
    params.push(fromIso);
    sql += ` AND created_at >= $${params.length}`;
  }
  if (toIso) {
    params.push(toIso);
    sql += ` AND created_at <= $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = await query(sql, params);

  let csv = 'id,event_type,stars,option_ids,device_type,created_at_ist\n';
  for (const r of rows) {
    const istTime = formatIstTimestamp(r.created_at);
    csv += [
      escapeCsvCell(r.id),
      escapeCsvCell(r.event_type),
      escapeCsvCell(r.stars),
      escapeCsvCell(r.option_ids),
      escapeCsvCell(r.device_type),
      escapeCsvCell(istTime),
    ].join(',') + '\n';
  }
  return csv;
}

export const exportService = {
  exportContentBackup,
  exportScansCsv,
  exportReviewsCsv,
};

export default exportService;


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
 * Generate CSV export of QR scans with IST timestamps
 */
export async function exportScansCsv({ from, to } = {}) {
  let sql = 'SELECT * FROM scans WHERE 1=1';
  const params = [];

  if (from) {
    params.push(new Date(from).toISOString());
    sql += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(new Date(to).toISOString());
    sql += ` AND created_at <= $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = await query(sql, params);

  let csv = 'id,qr_id,device_type,os,browser,created_at_ist\n';
  for (const r of rows) {
    const istTime = new Date(new Date(r.created_at).getTime() + 5.5 * 3600000).toISOString().replace('Z', '+05:30');
    csv += `"${r.id}","${r.qr_id}","${r.device_type}","${r.os}","${r.browser}","${istTime}"\n`;
  }
  return csv;
}

/**
 * Generate CSV export of review events with IST timestamps
 */
export async function exportReviewsCsv({ from, to } = {}) {
  let sql = 'SELECT * FROM review_events WHERE 1=1';
  const params = [];

  if (from) {
    params.push(new Date(from).toISOString());
    sql += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(new Date(to).toISOString());
    sql += ` AND created_at <= $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';

  const rows = await query(sql, params);

  let csv = 'id,event_type,stars,option_ids,device_type,created_at_ist\n';
  for (const r of rows) {
    const istTime = new Date(new Date(r.created_at).getTime() + 5.5 * 3600000).toISOString().replace('Z', '+05:30');
    csv += `"${r.id}","${r.event_type}","${r.stars || ''}","${(r.option_ids || '').replace(/"/g, '""')}","${r.device_type || ''}","${istTime}"\n`;
  }
  return csv;
}

export const exportService = {
  exportContentBackup,
  exportScansCsv,
  exportReviewsCsv,
};

export default exportService;


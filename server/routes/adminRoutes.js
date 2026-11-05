import express from 'express';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { cloudinaryService } from '../cloudinary.js';
import { generateQRCode, generateTableTentPDF } from '../qrGenerator.js';
import {
  calculateSpecialPrice,
  getPricingSettings,
  recalculateAllNonOverriddenPrices,
} from '../pricing.js';

const router = express.Router();
router.use(requireAuth);

// ============================================================================
// 1. CLOUDINARY DIRECT UPLOAD SIGNATURE
// ============================================================================
router.post('/cloudinary-sign', (req, res) => {
  try {
    const { folder, resourceType } = req.body || {};
    const signatureData = cloudinaryService.generateUploadSignature({
      folder: folder || 'restaurant/dishes',
      resourceType: resourceType || 'image',
    });
    return res.json(signatureData);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 2. DASHBOARD ANALYTICS (Filtered by Date Range in Asia/Kolkata)
// ============================================================================
router.get('/dashboard', async (req, res) => {
  try {
    const range = req.query.range || '7D'; // Today, 7D, 30D, 90D, All, Custom
    const now = new Date();

    let startDate;
    if (range === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === '7D') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '30D') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '90D') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === 'Custom' && req.query.from) {
      startDate = new Date(req.query.from).toISOString();
    } else {
      startDate = new Date(0).toISOString();
    }

    // 1. Scan KPIs (Today, 7D, 30D, All-Time, split Main vs Special)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [allScans] = await query('SELECT COUNT(*) as count FROM scans');
    const [allMainScans] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'menu'");
    const [allSpecialScans] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'special'");

    const [todayScans] = await query('SELECT COUNT(*) as count FROM scans WHERE created_at >= $1', [todayStart]);
    const [todayMain] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'menu' AND created_at >= $1", [todayStart]);
    const [todaySpecial] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'special' AND created_at >= $1", [todayStart]);

    const [sevenDaysScans] = await query('SELECT COUNT(*) as count FROM scans WHERE created_at >= $1', [sevenDaysAgo]);
    const [sevenDaysMain] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'menu' AND created_at >= $1", [sevenDaysAgo]);
    const [sevenDaysSpecial] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'special' AND created_at >= $1", [sevenDaysAgo]);

    const [thirtyDaysScans] = await query('SELECT COUNT(*) as count FROM scans WHERE created_at >= $1', [thirtyDaysAgo]);
    const [thirtyDaysMain] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'menu' AND created_at >= $1", [thirtyDaysAgo]);
    const [thirtyDaysSpecial] = await query("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'special' AND created_at >= $1", [thirtyDaysAgo]);

    // Scans in chosen date range
    const rangeScans = await query(
      'SELECT id, qr_id, device_type, os, browser, created_at FROM scans WHERE created_at >= $1 ORDER BY created_at ASC',
      [startDate]
    );

    // Peak hours (0-23 in IST = UTC + 5:30) and Day of Week
    const hoursCount = Array(24).fill(0).map(() => ({ hour: 0, main: 0, special: 0, total: 0 }));
    for (let h = 0; h < 24; h++) hoursCount[h].hour = h;

    const daysCount = [
      { day: 'Sun', main: 0, special: 0, total: 0 },
      { day: 'Mon', main: 0, special: 0, total: 0 },
      { day: 'Tue', main: 0, special: 0, total: 0 },
      { day: 'Wed', main: 0, special: 0, total: 0 },
      { day: 'Thu', main: 0, special: 0, total: 0 },
      { day: 'Fri', main: 0, special: 0, total: 0 },
      { day: 'Sat', main: 0, special: 0, total: 0 },
    ];

    // Devices & OS breakdown
    const devicesCount = { Android: 0, iOS: 0, Desktop: 0, Other: 0 };
    const osCount = {};

    for (const scan of rangeScans) {
      // Calculate IST time (UTC + 5.5 hours)
      const date = new Date(scan.created_at);
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      const hour = istDate.getUTCHours();
      const day = istDate.getUTCDay();

      if (hour >= 0 && hour < 24) {
        hoursCount[hour].total += 1;
        if (scan.qr_id === 'menu') hoursCount[hour].main += 1;
        else if (scan.qr_id === 'special') hoursCount[hour].special += 1;
      }

      if (day >= 0 && day <= 6) {
        daysCount[day].total += 1;
        if (scan.qr_id === 'menu') daysCount[day].main += 1;
        else if (scan.qr_id === 'special') daysCount[day].special += 1;
      }

      const dev = scan.device_type || 'Other';
      if (devicesCount[dev] !== undefined) devicesCount[dev] += 1;
      else devicesCount.Other += 1;

      const osName = scan.os || 'Unknown';
      osCount[osName] = (osCount[osName] || 0) + 1;
    }

    // Menu Health stats
    const [dishesTotal] = await query('SELECT COUNT(*) as count FROM dishes WHERE deleted_at IS NULL');
    const [dishesSoldOut] = await query('SELECT COUNT(*) as count FROM dishes WHERE is_available = 0 AND deleted_at IS NULL');
    const [dishesHidden] = await query('SELECT COUNT(*) as count FROM dishes WHERE is_visible = 0 AND deleted_at IS NULL');
    const [dishesSpecialOnly] = await query("SELECT COUNT(*) as count FROM dishes WHERE scope = 'special_only' AND deleted_at IS NULL");
    const [dishesBoth] = await query("SELECT COUNT(*) as count FROM dishes WHERE scope = 'both' AND deleted_at IS NULL");

    // Review Summary stats
    const [revStarted] = await query("SELECT COUNT(*) as count FROM review_events WHERE event_type = 'started'");
    const [revSubmitted] = await query("SELECT COUNT(*) as count FROM review_events WHERE event_type = 'submitted'");
    const [revAvgStars] = await query("SELECT AVG(stars) as avg_stars FROM review_events WHERE event_type = 'submitted' AND stars IS NOT NULL");

    return res.json({
      kpis: {
        today: { total: todayScans?.count || 0, main: todayMain?.count || 0, special: todaySpecial?.count || 0 },
        last7Days: { total: sevenDaysScans?.count || 0, main: sevenDaysMain?.count || 0, special: sevenDaysSpecial?.count || 0 },
        last30Days: { total: thirtyDaysScans?.count || 0, main: thirtyDaysMain?.count || 0, special: thirtyDaysSpecial?.count || 0 },
        allTime: { total: allScans?.count || 0, main: allMainScans?.count || 0, special: allSpecialScans?.count || 0 },
      },
      scansList: rangeScans,
      peakHours: hoursCount,
      daysOfWeek: daysCount,
      devices: devicesCount,
      osBreakdown: osCount,
      menuHealth: {
        totalDishes: dishesTotal?.count || 0,
        soldOut: dishesSoldOut?.count || 0,
        hidden: dishesHidden?.count || 0,
        mainMenuCount: dishesBoth?.count || 0,
        specialMenuCount: (dishesBoth?.count || 0) + (dishesSpecialOnly?.count || 0),
      },
      reviews: {
        started: revStarted?.count || 0,
        submitted: revSubmitted?.count || 0,
        conversionPercent: revStarted?.count ? Math.round(((revSubmitted?.count || 0) / revStarted.count) * 100) : 0,
        averageStars: revAvgStars?.avg_stars ? Number(revAvgStars.avg_stars).toFixed(1) : '5.0',
      },
    });
  } catch (err) {
    console.error('[Admin] Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to aggregate dashboard analytics' });
  }
});

// ============================================================================
// 3. CATEGORIES CRUD
// ============================================================================
router.get('/categories', async (req, res) => {
  const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  return res.json(categories);
});

router.post('/categories', async (req, res) => {
  const { name, description, visible, sort_order } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });

  const id = `cat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO categories (id, name, description, visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [id, name.trim(), description || '', visible !== undefined ? (visible ? 1 : 0) : 1, sort_order || 0, now, now]
  );

  return res.json({ success: true, id });
});

router.put('/categories/:id', async (req, res) => {
  const { name, description, visible, sort_order } = req.body || {};
  const { id } = req.params;
  const now = new Date().toISOString();

  await query(
    'UPDATE categories SET name = $1, description = $2, visible = $3, sort_order = $4, updated_at = $5 WHERE id = $6',
    [name, description, visible ? 1 : 0, sort_order, now, id]
  );

  return res.json({ success: true });
});

router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { reassignToCategoryId, deleteDishes } = req.query;

  // Check dishes in this category
  const [dishCount] = await query('SELECT COUNT(*) as count FROM dishes WHERE category_id = $1 AND deleted_at IS NULL', [id]);

  if (dishCount?.count > 0) {
    if (reassignToCategoryId) {
      await query('UPDATE dishes SET category_id = $1 WHERE category_id = $2', [reassignToCategoryId, id]);
    } else if (deleteDishes === 'true') {
      const now = new Date().toISOString();
      await query('UPDATE dishes SET deleted_at = $1 WHERE category_id = $2', [now, id]);
    } else {
      return res.status(400).json({
        error: `Category contains ${dishCount.count} dish(es). You must choose to reassign them to another category or delete them too.`,
        requiresChoice: true,
        dishCount: dishCount.count,
      });
    }
  }

  await query('DELETE FROM categories WHERE id = $1', [id]);
  return res.json({ success: true });
});

router.put('/categories/reorder/batch', async (req, res) => {
  const { items } = req.body || {}; // array of { id, sort_order }
  if (Array.isArray(items)) {
    for (const item of items) {
      await query('UPDATE categories SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
  }
  return res.json({ success: true });
});

// ============================================================================
// 4. DISHES CRUD, VARIANTS, IMAGES & PRICING
// ============================================================================
router.get('/dishes', async (req, res) => {
  const { category, scope, availability, visibility, search } = req.query;

  let sql = 'SELECT * FROM dishes WHERE deleted_at IS NULL';
  const params = [];

  if (category) {
    params.push(category);
    sql += ` AND category_id = $${params.length}`;
  }
  if (scope) {
    params.push(scope);
    sql += ` AND scope = $${params.length}`;
  }
  if (availability !== undefined && availability !== '') {
    params.push(availability === '1' || availability === 'true' ? 1 : 0);
    sql += ` AND is_available = $${params.length}`;
  }
  if (visibility !== undefined && visibility !== '') {
    params.push(visibility === '1' || visibility === 'true' ? 1 : 0);
    sql += ` AND is_visible = $${params.length}`;
  }
  if (search) {
    params.push(`%${search.toLowerCase().trim()}%`);
    sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC';

  const dishes = await query(sql, params);

  // Batch fetch images and variants in 2 fast queries (eliminates 560 sequential queries)
  const allImages = await query('SELECT * FROM dish_images ORDER BY sort_order ASC');
  const imageMap = new Map();
  for (const img of allImages) {
    if (!imageMap.has(img.dish_id)) imageMap.set(img.dish_id, []);
    imageMap.get(img.dish_id).push(img);
  }

  const allVariants = await query('SELECT * FROM dish_variants ORDER BY sort_order ASC');
  const variantMap = new Map();
  for (const v of allVariants) {
    if (!variantMap.has(v.dish_id)) variantMap.set(v.dish_id, []);
    variantMap.get(v.dish_id).push(v);
  }

  for (const dish of dishes) {
    dish.images = imageMap.get(dish.id) || [];
    dish.variants = variantMap.get(dish.id) || [];
    try {
      dish.tags = typeof dish.tags === 'string' ? JSON.parse(dish.tags || '[]') : (dish.tags || []);
      dish.badges = typeof dish.badges === 'string' ? JSON.parse(dish.badges || '[]') : (dish.badges || []);
    } catch {
      dish.tags = [];
      dish.badges = [];
    }
  }

  return res.json(dishes);
});

router.post('/dishes', async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      serving_note,
      price_type = 'single',
      base_price,
      special_price_override,
      variants = [],
      images = [],
      tags = ['veg'],
      spice_level = 'none',
      badges = [],
      is_available = 1,
      is_visible = 1,
      scope = 'both',
      sort_order = 0,
    } = req.body || {};

    if (!name || !name.trim()) return res.status(400).json({ error: 'Dish name is required' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });

    if (price_type === 'single') {
      const numPrice = Number(base_price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Dish price must be a valid positive number' });
      }
    } else if (price_type === 'variants') {
      if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ error: 'Variants list is required for variant pricing' });
      }
      for (const v of variants) {
        const numVarPrice = Number(v.base_price);
        if (isNaN(numVarPrice) || numVarPrice <= 0) {
          return res.status(400).json({ error: `Variant price for "${v.label || 'Variant'}" must be a valid positive number` });
        }
      }
    }

    const { markup, rounding } = await getPricingSettings();
    const id = `dish_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    // Calculate special price
    let specialPrice = null;
    if (scope === 'special_only') {
      // Special only dishes have final price entered directly
      specialPrice = Number(base_price) || 0;
    } else {
      if (special_price_override !== null && special_price_override !== undefined && special_price_override !== '') {
        specialPrice = Number(special_price_override);
      } else {
        specialPrice = calculateSpecialPrice(base_price, markup, rounding);
      }
    }

    await query(
      `INSERT INTO dishes (
        id, name, description, category_id, serving_note, price_type, base_price, special_price,
        special_price_override, tags, spice_level, badges, is_available, is_visible, scope, sort_order, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id,
        name.trim(),
        description || '',
        category_id,
        serving_note || '',
        price_type,
        Number(base_price) || 0,
        specialPrice,
        special_price_override ? Number(special_price_override) : null,
        JSON.stringify(tags),
        spice_level,
        JSON.stringify(badges),
        is_available ? 1 : 0,
        is_visible ? 1 : 0,
        scope,
        sort_order || 0,
        now,
        now,
      ]
    );

    // Save variants if price_type is 'variants'
    if (price_type === 'variants' && Array.isArray(variants)) {
      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx];
        const vId = `${id}_var_${vIdx}`;
        let vSpecial = null;
        if (scope === 'special_only') {
          vSpecial = Number(v.base_price) || 0;
        } else if (v.special_price_override !== null && v.special_price_override !== undefined && v.special_price_override !== '') {
          vSpecial = Number(v.special_price_override);
        } else {
          vSpecial = calculateSpecialPrice(v.base_price, markup, rounding);
        }

        await query(
          'INSERT INTO dish_variants (id, dish_id, label, base_price, special_price, special_price_override, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [vId, id, v.label, Number(v.base_price) || 0, vSpecial, v.special_price_override ? Number(v.special_price_override) : null, vIdx, now]
        );
      }
    }

    // Save images (up to 5)
    if (Array.isArray(images)) {
      const limitedImages = images.slice(0, 5);
      for (let imgIdx = 0; imgIdx < limitedImages.length; imgIdx++) {
        const img = limitedImages[imgIdx];
        const imgId = `${id}_img_${imgIdx}`;
        await query(
          'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [imgId, id, img.public_id || null, img.url, img.width || 800, img.height || 600, imgIdx, imgIdx === 0 ? 1 : 0, now]
        );
      }
    }

    return res.json({ success: true, id });
  } catch (err) {
    console.error('[Admin] Error creating dish:', err);
    return res.status(500).json({ error: 'Failed to create dish' });
  }
});

router.put('/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingRows = await query('SELECT * FROM dishes WHERE id = $1', [id]);
    if (existingRows.length === 0) return res.status(404).json({ error: 'Dish not found' });
    const existing = existingRows[0];

    const body = req.body || {};
    const name = body.name !== undefined ? body.name : existing.name;
    const description = body.description !== undefined ? body.description : (existing.description || '');
    const category_id = body.category_id !== undefined ? body.category_id : existing.category_id;
    const serving_note = body.serving_note !== undefined ? body.serving_note : (existing.serving_note || '');
    const price_type = body.price_type !== undefined ? body.price_type : existing.price_type;
    const base_price = body.base_price !== undefined ? body.base_price : existing.base_price;
    const special_price_override = body.special_price_override !== undefined ? body.special_price_override : existing.special_price_override;
    const tags = body.tags !== undefined ? body.tags : (typeof existing.tags === 'string' ? JSON.parse(existing.tags || '[]') : (existing.tags || []));
    const spice_level = body.spice_level !== undefined ? body.spice_level : (existing.spice_level || 'none');
    const badges = body.badges !== undefined ? body.badges : (typeof existing.badges === 'string' ? JSON.parse(existing.badges || '[]') : (existing.badges || []));
    const is_available = body.is_available !== undefined ? (body.is_available ? 1 : 0) : existing.is_available;
    const is_visible = body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : existing.is_visible;
    const scope = body.scope !== undefined ? body.scope : existing.scope;
    const sort_order = body.sort_order !== undefined ? body.sort_order : existing.sort_order;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Dish name cannot be empty' });
    if (!category_id) return res.status(400).json({ error: 'Category cannot be empty' });

    if (price_type === 'single') {
      const numPrice = Number(base_price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Dish price must be a valid positive number' });
      }
    } else if (price_type === 'variants' && Array.isArray(body.variants)) {
      for (const v of body.variants) {
        const numVarPrice = Number(v.base_price);
        if (isNaN(numVarPrice) || numVarPrice <= 0) {
          return res.status(400).json({ error: `Variant price for "${v.label || 'Variant'}" must be a valid positive number` });
        }
      }
    }

    const { markup, rounding } = await getPricingSettings();
    const now = new Date().toISOString();

    let specialPrice = null;
    if (scope === 'special_only') {
      specialPrice = Number(base_price) || 0;
    } else {
      if (special_price_override !== null && special_price_override !== undefined && special_price_override !== '') {
        specialPrice = Number(special_price_override);
      } else {
        specialPrice = calculateSpecialPrice(base_price, markup, rounding);
      }
    }

    await query(
      `UPDATE dishes SET
        name = $1, description = $2, category_id = $3, serving_note = $4, price_type = $5,
        base_price = $6, special_price = $7, special_price_override = $8, tags = $9,
        spice_level = $10, badges = $11, is_available = $12, is_visible = $13, scope = $14,
        sort_order = $15, updated_at = $16
      WHERE id = $17`,
      [
        name.trim(),
        description || '',
        category_id,
        serving_note || '',
        price_type,
        Number(base_price) || 0,
        specialPrice,
        special_price_override ? Number(special_price_override) : null,
        JSON.stringify(tags),
        spice_level,
        JSON.stringify(badges),
        is_available,
        is_visible,
        scope,
        sort_order || 0,
        now,
        id,
      ]
    );

    // Only replace variants if explicitly provided
    if (body.variants !== undefined) {
      await query('DELETE FROM dish_variants WHERE dish_id = $1', [id]);
      if (price_type === 'variants' && Array.isArray(body.variants)) {
        for (let vIdx = 0; vIdx < body.variants.length; vIdx++) {
          const v = body.variants[vIdx];
          const vId = `${id}_var_${vIdx}_${Date.now()}`;
          let vSpecial = null;
          if (scope === 'special_only') {
            vSpecial = Number(v.base_price) || 0;
          } else if (v.special_price_override !== null && v.special_price_override !== undefined && v.special_price_override !== '') {
            vSpecial = Number(v.special_price_override);
          } else {
            vSpecial = calculateSpecialPrice(v.base_price, markup, rounding);
          }

          await query(
            'INSERT INTO dish_variants (id, dish_id, label, base_price, special_price, special_price_override, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [vId, id, v.label, Number(v.base_price) || 0, vSpecial, v.special_price_override ? Number(v.special_price_override) : null, vIdx, now]
          );
        }
      }
    }

    // Only replace images if explicitly provided
    if (body.images !== undefined) {
      const existingImages = await query('SELECT public_id FROM dish_images WHERE dish_id = $1', [id]);
      const incomingPublicIds = new Set((body.images || []).map((img) => img.public_id).filter(Boolean));

      for (const oldImg of existingImages) {
        if (oldImg.public_id && !incomingPublicIds.has(oldImg.public_id)) {
          await cloudinaryService.deleteAsset(oldImg.public_id, 'image');
        }
      }

      await query('DELETE FROM dish_images WHERE dish_id = $1', [id]);
      if (Array.isArray(body.images)) {
        const limitedImages = body.images.slice(0, 5);
        for (let imgIdx = 0; imgIdx < limitedImages.length; imgIdx++) {
          const img = limitedImages[imgIdx];
          const imgId = `${id}_img_${imgIdx}_${Date.now()}`;
          await query(
            'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [imgId, id, img.public_id || null, img.url, img.width || 800, img.height || 600, imgIdx, imgIdx === 0 ? 1 : 0, now]
          );
        }
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[Admin] Error updating dish:', err);
    return res.status(500).json({ error: 'Failed to update dish' });
  }
});

router.delete('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  // Cloudinary cleanup of images
  const images = await query('SELECT public_id FROM dish_images WHERE dish_id = $1', [id]);
  for (const img of images) {
    if (img.public_id) {
      await cloudinaryService.deleteAsset(img.public_id, 'image');
    }
  }

  // Soft delete dish
  await query('UPDATE dishes SET deleted_at = $1 WHERE id = $2', [now, id]);
  return res.json({ success: true });
});

router.post('/dishes/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  const dishes = await query('SELECT * FROM dishes WHERE id = $1', [id]);
  if (dishes.length === 0) return res.status(404).json({ error: 'Dish not found' });

  const original = dishes[0];
  const newId = `dish_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  await query(
    `INSERT INTO dishes (
      id, name, description, category_id, serving_note, price_type, base_price, special_price,
      special_price_override, tags, spice_level, badges, is_available, is_visible, scope, sort_order, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    [
      newId,
      `${original.name} (Copy)`,
      original.description,
      original.category_id,
      original.serving_note,
      original.price_type,
      original.base_price,
      original.special_price,
      original.special_price_override,
      original.tags,
      original.spice_level,
      original.badges,
      original.is_available,
      original.is_visible,
      original.scope,
      (original.sort_order || 0) + 1,
      now,
      now,
    ]
  );

  // Duplicate variants
  const variants = await query('SELECT * FROM dish_variants WHERE dish_id = $1', [id]);
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    await query(
      'INSERT INTO dish_variants (id, dish_id, label, base_price, special_price, special_price_override, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`${newId}_var_${i}`, newId, v.label, v.base_price, v.special_price, v.special_price_override, v.sort_order, now]
    );
  }

  // Duplicate image links
  const images = await query('SELECT * FROM dish_images WHERE dish_id = $1', [id]);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    await query(
      'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [`${newId}_img_${i}`, newId, img.public_id, img.url, img.width, img.height, img.sort_order, img.is_cover, now]
    );
  }

  return res.json({ success: true, newId });
});

router.post('/dishes/bulk', async (req, res) => {
  const { action, dishIds, value } = req.body || {};
  if (!Array.isArray(dishIds) || dishIds.length === 0) {
    return res.status(400).json({ error: 'No dishes selected' });
  }

  const now = new Date().toISOString();

  if (action === 'set_available') {
    for (const dId of dishIds) {
      await query('UPDATE dishes SET is_available = $1, updated_at = $2 WHERE id = $3', [value ? 1 : 0, now, dId]);
    }
  } else if (action === 'set_visible') {
    for (const dId of dishIds) {
      await query('UPDATE dishes SET is_visible = $1, updated_at = $2 WHERE id = $3', [value ? 1 : 0, now, dId]);
    }
  } else if (action === 'move_category') {
    for (const dId of dishIds) {
      await query('UPDATE dishes SET category_id = $1, updated_at = $2 WHERE id = $3', [value, now, dId]);
    }
  } else if (action === 'delete') {
    for (const dId of dishIds) {
      await query('UPDATE dishes SET deleted_at = $1 WHERE id = $2', [now, dId]);
    }
  }

  return res.json({ success: true, affected: dishIds.length });
});

router.put('/dishes/reorder/batch', async (req, res) => {
  const { items } = req.body || {};
  if (Array.isArray(items)) {
    for (const item of items) {
      await query('UPDATE dishes SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
  }
  return res.json({ success: true });
});

// ============================================================================
// 5. MENUS (Main & Special: Video, Titles, Posters)
// ============================================================================
router.get('/menus', async (req, res) => {
  const menus = await query('SELECT * FROM menus ORDER BY id ASC');
  return res.json(menus);
});

router.put('/menus/:id', async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, video_url, video_public_id, poster_url, poster_public_id } = req.body || {};
  const now = new Date().toISOString();

  // If replacing or removing video, cleanup old Cloudinary asset
  const existing = await query('SELECT video_public_id, poster_public_id FROM menus WHERE id = $1', [id]);
  if (existing.length > 0) {
    const old = existing[0];
    if (old.video_public_id && old.video_public_id !== video_public_id) {
      await cloudinaryService.deleteAsset(old.video_public_id, 'video');
    }
    if (old.poster_public_id && old.poster_public_id !== poster_public_id) {
      await cloudinaryService.deleteAsset(old.poster_public_id, 'image');
    }
  }

  await query(
    `UPDATE menus SET
      title = $1, subtitle = $2, video_url = $3, video_public_id = $4,
      poster_url = $5, poster_public_id = $6, updated_at = $7
    WHERE id = $8`,
    [title, subtitle, video_url || null, video_public_id || null, poster_url || null, poster_public_id || null, now, id]
  );

  return res.json({ success: true });
});

// ============================================================================
// 6. QR CODES MANAGEMENT & DOWNLOADS
// ============================================================================
router.get('/qr-codes', async (req, res) => {
  const qrs = await query('SELECT * FROM qr_codes ORDER BY id ASC');
  // Enrich with total scan counts
  for (const qr of qrs) {
    const [count] = await query('SELECT COUNT(*) as count FROM scans WHERE qr_id = $1', [qr.id]);
    qr.scanCount = count?.count || 0;
  }
  return res.json(qrs);
});

router.put('/qr-codes/:id', async (req, res) => {
  const { id } = req.params;
  const { label, destination, is_enabled } = req.body || {};
  const now = new Date().toISOString();

  await query(
    'UPDATE qr_codes SET label = $1, destination = $2, is_enabled = $3, updated_at = $4 WHERE id = $5',
    [label, destination, is_enabled ? 1 : 0, now, id]
  );

  return res.json({ success: true });
});

router.get('/qr-codes/:id/download', async (req, res) => {
  const { id } = req.params;
  const format = (req.query.format || 'png').toLowerCase();

  const qrs = await query('SELECT * FROM qr_codes WHERE id = $1', [id]);
  if (qrs.length === 0) return res.status(404).send('QR Code not found');

  const qr = qrs[0];
  const siteUrl = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
  const encodedQrUrl = `${siteUrl}/q/${qr.id}`;

  if (format === 'svg') {
    const svgString = await generateQRCode(encodedQrUrl, 'svg');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${qr.id}-menu-qr.svg"`);
    return res.send(svgString);
  } else if (format === 'pdf') {
    const pdfBuffer = await generateTableTentPDF({
      qrUrl: encodedQrUrl,
      label: qr.label,
      restaurantName: 'Amol Veg Resto',
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${qr.id}-table-tent-a5.pdf"`);
    return res.send(pdfBuffer);
  } else {
    // PNG default (1024px)
    const pngBuffer = await generateQRCode(encodedQrUrl, 'png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${qr.id}-menu-qr.png"`);
    return res.send(pngBuffer);
  }
});

// ============================================================================
// 7. WEBSITE CONTENT: POPULAR DISHES, GALLERY, CONTACT, FOOTER, LEGAL, SEO
// ============================================================================
// Popular Dishes (max 12)
router.get('/popular-dishes', async (req, res) => {
  const dishes = await query('SELECT * FROM popular_dishes ORDER BY sort_order ASC');
  return res.json(dishes);
});

router.post('/popular-dishes', async (req, res) => {
  const [totalCount] = await query('SELECT COUNT(*) as count FROM popular_dishes');
  if (totalCount?.count >= 12) {
    return res.status(400).json({ error: 'Maximum limit of 12 popular dishes reached.' });
  }

  const { title, description, price, image_url, image_public_id, is_visible = 1, sort_order = 0 } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = `pop_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO popular_dishes (id, title, description, price, image_url, image_public_id, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [id, title, description || '', price || '', image_url || '', image_public_id || null, is_visible ? 1 : 0, sort_order, now, now]
  );

  return res.json({ success: true, id });
});

router.put('/popular-dishes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, price, image_url, image_public_id, is_visible, sort_order } = req.body || {};
  const now = new Date().toISOString();

  await query(
    'UPDATE popular_dishes SET title = $1, description = $2, price = $3, image_url = $4, image_public_id = $5, is_visible = $6, sort_order = $7, updated_at = $8 WHERE id = $9',
    [title, description, price, image_url, image_public_id, is_visible ? 1 : 0, sort_order, now, id]
  );

  return res.json({ success: true });
});

router.delete('/popular-dishes/:id', async (req, res) => {
  const { id } = req.params;
  const existing = await query('SELECT image_public_id FROM popular_dishes WHERE id = $1', [id]);
  if (existing.length > 0 && existing[0].image_public_id) {
    await cloudinaryService.deleteAsset(existing[0].image_public_id, 'image');
  }
  await query('DELETE FROM popular_dishes WHERE id = $1', [id]);
  return res.json({ success: true });
});

router.put('/popular-dishes/reorder/batch', async (req, res) => {
  const { items } = req.body || {};
  if (Array.isArray(items)) {
    for (const item of items) {
      await query('UPDATE popular_dishes SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
  }
  return res.json({ success: true });
});

// Gallery Items
router.get('/gallery', async (req, res) => {
  const items = await query('SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC');
  return res.json(items);
});

router.post('/gallery', async (req, res) => {
  const { url, public_id, alt_text, caption, category = 'food', aspect = 'standard', is_visible = 1, sort_order = 0 } = req.body || {};
  if (!url) return res.status(400).json({ error: 'Image URL is required' });
  if (!alt_text || !alt_text.trim()) return res.status(400).json({ error: 'Alt text is required for SEO' });

  const id = `gal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO gallery_items (id, url, public_id, alt_text, caption, category, aspect, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [id, url, public_id || null, alt_text.trim(), caption || '', category, aspect, is_visible ? 1 : 0, sort_order, now, now]
  );

  return res.json({ success: true, id });
});

router.put('/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const { url, public_id, alt_text, caption, category, aspect, is_visible, sort_order } = req.body || {};
  const now = new Date().toISOString();

  await query(
    'UPDATE gallery_items SET url = $1, public_id = $2, alt_text = $3, caption = $4, category = $5, aspect = $6, is_visible = $7, sort_order = $8, updated_at = $9 WHERE id = $10',
    [url, public_id, alt_text, caption, category, aspect, is_visible ? 1 : 0, sort_order, now, id]
  );

  return res.json({ success: true });
});

router.delete('/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const existing = await query('SELECT public_id FROM gallery_items WHERE id = $1', [id]);
  if (existing.length > 0 && existing[0].public_id) {
    await cloudinaryService.deleteAsset(existing[0].public_id, 'image');
  }
  await query('DELETE FROM gallery_items WHERE id = $1', [id]);
  return res.json({ success: true });
});

router.put('/gallery/reorder/batch', async (req, res) => {
  const { items } = req.body || {};
  if (Array.isArray(items)) {
    for (const item of items) {
      await query('UPDATE gallery_items SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
  }
  return res.json({ success: true });
});

// Site Content (Contact/Social, Footer/FSSAI)
router.get('/site-content', async (req, res) => {
  const rows = await query('SELECT * FROM site_content');
  const result = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.data);
    } catch {
      result[row.key] = row.data;
    }
  }
  return res.json(result);
});

router.put('/site-content/:key', async (req, res) => {
  const { key } = req.params;
  const now = new Date().toISOString();
  const serialized = JSON.stringify(req.body);

  const existing = await query('SELECT key FROM site_content WHERE key = $1', [key]);
  if (existing.length === 0) {
    await query('INSERT INTO site_content (key, data, updated_at) VALUES ($1, $2, $3)', [key, serialized, now]);
  } else {
    await query('UPDATE site_content SET data = $1, updated_at = $2 WHERE key = $3', [serialized, now, key]);
  }

  return res.json({ success: true });
});

// Legal Pages (Privacy Policy & Terms and Conditions)
router.get('/legal-pages', async (req, res) => {
  const pages = await query('SELECT * FROM legal_pages ORDER BY id ASC');
  return res.json(pages);
});

router.put('/legal-pages/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content_html } = req.body || {};

  // Sanitize rich text HTML
  const sanitizedHtml = sanitizeHtml(content_html || '', {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'hr', 'blockquote'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
  });

  const now = new Date().toISOString();
  await query('UPDATE legal_pages SET title = $1, content_html = $2, updated_at = $3 WHERE id = $4', [
    title || '',
    sanitizedHtml,
    now,
    id,
  ]);

  return res.json({ success: true });
});

// SEO Pages
router.get('/seo-pages', async (req, res) => {
  const pages = await query('SELECT * FROM seo_pages ORDER BY id ASC');
  return res.json(pages);
});

router.put('/seo-pages/:id', async (req, res) => {
  const { id } = req.params;
  const { title, meta_description, og_image_url, noindex } = req.body || {};
  const now = new Date().toISOString();

  await query(
    'UPDATE seo_pages SET title = $1, meta_description = $2, og_image_url = $3, noindex = $4, updated_at = $5 WHERE id = $6',
    [title || '', meta_description || '', og_image_url || null, noindex ? 1 : 0, now, id]
  );

  return res.json({ success: true });
});

// ============================================================================
// 8. REVIEW SYSTEM CONTROLS & STATS
// ============================================================================
router.get('/reviews/config', async (req, res) => {
  const [googleLinkRow] = await query("SELECT value FROM review_settings WHERE key = 'google_review_url'");
  const options = await query('SELECT * FROM review_options ORDER BY sort_order ASC');
  const url = googleLinkRow?.value || '';
  return res.json({
    googleReviewUrl: url,
    google_review_url: url,
    options,
  });
});

router.put('/reviews/google-link', async (req, res) => {
  const url = (req.body?.url || req.body?.google_review_url || '').trim();
  if (!url || !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Google Review URL must begin with https://' });
  }

  // Strictly validate host is Google Place review link
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const validHosts = ['search.google.com', 'g.page', 'maps.app.goo.gl', 'goo.gl'];
  const isValidHost = validHosts.some((h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`));
  if (!isValidHost) {
    return res.status(400).json({
      error: 'Invalid Google URL host. Must be search.google.com, g.page, or maps.app.goo.gl',
    });
  }

  const now = new Date().toISOString();
  await query("UPDATE review_settings SET value = $1, updated_at = $2 WHERE key = 'google_review_url'", [url.trim(), now]);
  return res.json({ success: true, message: 'Google review link saved successfully.' });
});

router.get('/reviews/options', async (req, res) => {
  const options = await query('SELECT * FROM review_options ORDER BY sort_order ASC');
  return res.json(options);
});

router.post('/reviews/options', async (req, res) => {
  const { label, positive_only, ai_hint } = req.body || {};
  if (!label || label.trim().length === 0 || label.trim().length > 30) {
    return res.status(400).json({ error: 'Option label is required (max 30 characters)' });
  }

  // Guardrail: Max 14 visible options
  const [visibleCount] = await query('SELECT COUNT(*) as count FROM review_options WHERE is_visible = 1');
  if (visibleCount?.count >= 14) {
    return res.status(400).json({ error: 'Cannot add option: Maximum limit of 14 visible options reached.' });
  }

  const id = `opt_${label.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)}_${Date.now().toString(36)}`;
  const [maxOrder] = await query('SELECT MAX(sort_order) as m FROM review_options');
  const sortOrder = (maxOrder?.m || 0) + 1;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO review_options (id, label, positive_only, ai_hint, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, label.trim(), positive_only ? 1 : 0, (ai_hint || '').substring(0, 80), 1, sortOrder, now, now]
  );

  return res.json({ success: true, id });
});

router.put('/reviews/options/:id', async (req, res) => {
  const { id } = req.params;
  const { label, positive_only, ai_hint, is_visible, sort_order } = req.body || {};

  if (label && label.trim().length > 30) {
    return res.status(400).json({ error: 'Label must be at most 30 characters' });
  }

  // Guardrail check if hiding or revealing: min 3, max 14 visible
  if (is_visible !== undefined) {
    const [currentVisible] = await query('SELECT COUNT(*) as count FROM review_options WHERE is_visible = 1');
    const existing = await query('SELECT is_visible FROM review_options WHERE id = $1', [id]);
    const currentlyVisible = existing[0]?.is_visible === 1;

    if (!is_visible && currentlyVisible && currentVisible?.count <= 3) {
      return res.status(400).json({ error: 'At least 3 visible review options are required.' });
    }
    if (is_visible && !currentlyVisible && currentVisible?.count >= 14) {
      return res.status(400).json({ error: 'Maximum 14 visible review options allowed.' });
    }
  }

  const now = new Date().toISOString();
  await query(
    'UPDATE review_options SET label = $1, positive_only = $2, ai_hint = $3, is_visible = $4, sort_order = $5, updated_at = $6 WHERE id = $7',
    [
      label?.trim(),
      positive_only ? 1 : 0,
      (ai_hint || '').substring(0, 80),
      is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
      sort_order || 0,
      now,
      id,
    ]
  );

  return res.json({ success: true });
});

router.delete('/reviews/options/:id', async (req, res) => {
  const { id } = req.params;
  const [currentVisible] = await query('SELECT COUNT(*) as count FROM review_options WHERE is_visible = 1');
  if (currentVisible?.count <= 3) {
    return res.status(400).json({ error: 'Cannot delete: Minimum 3 visible review options must remain.' });
  }

  await query('DELETE FROM review_options WHERE id = $1', [id]);
  return res.json({ success: true });
});

router.put('/reviews/options/reorder/batch', async (req, res) => {
  const { items } = req.body || {};
  if (Array.isArray(items)) {
    for (const item of items) {
      await query('UPDATE review_options SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
  }
  return res.json({ success: true });
});

router.get('/reviews/stats', async (req, res) => {
  try {
    const [startedRow] = await query("SELECT COUNT(*) as count FROM review_events WHERE event_type = 'started'");
    const [submittedRow] = await query("SELECT COUNT(*) as count FROM review_events WHERE event_type = 'submitted'");

    // Star distribution (1 to 5)
    const starRows = await query(
      "SELECT stars, COUNT(*) as count FROM review_events WHERE event_type = 'submitted' AND stars IS NOT NULL GROUP BY stars"
    );
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumStars = 0;
    let totalRated = 0;
    for (const r of starRows) {
      if (r.stars >= 1 && r.stars <= 5) {
        starCounts[r.stars] = r.count;
        sumStars += r.stars * r.count;
        totalRated += r.count;
      }
    }

    const averageStars = totalRated > 0 ? (sumStars / totalRated).toFixed(1) : '5.0';

    // Most selected options count
    const submittedEvents = await query(
      "SELECT option_ids FROM review_events WHERE event_type = 'submitted' AND option_ids IS NOT NULL"
    );
    const optionCounts = {};
    for (const ev of submittedEvents) {
      try {
        const ids = JSON.parse(ev.option_ids || '[]');
        for (const oId of ids) {
          optionCounts[oId] = (optionCounts[oId] || 0) + 1;
        }
      } catch {}
    }

    // Submissions per day (last 14 days)
    const dailySubmissions = await query(
      `SELECT SUBSTR(created_at, 1, 10) as day, COUNT(*) as count
       FROM review_events
       WHERE event_type = 'submitted'
       GROUP BY SUBSTR(created_at, 1, 10)
       ORDER BY day DESC LIMIT 14`
    );

    return res.json({
      started: startedRow?.count || 0,
      submitted: submittedRow?.count || 0,
      conversionPercent: startedRow?.count ? Math.round(((submittedRow?.count || 0) / startedRow.count) * 100) : 0,
      averageStars,
      starDistribution: starCounts,
      optionSelectionCounts: optionCounts,
      dailyTrend: dailySubmissions.reverse(),
      notice: 'Submitted = opened Google review page. We cannot see whether the customer finished posting.',
    });
  } catch (err) {
    console.error('[Admin] Review stats error:', err);
    return res.status(500).json({ error: 'Failed to calculate review analytics' });
  }
});

// ============================================================================
// 9. SETTINGS & PRICING
// ============================================================================
router.get('/settings', async (req, res) => {
  const { markup, rounding } = await getPricingSettings();
  return res.json({
    special_markup_percent: markup,
    rounding_step: rounding,
  });
});

router.put('/settings', async (req, res) => {
  const { special_markup_percent, rounding_step } = req.body || {};
  const now = new Date().toISOString();

  if (special_markup_percent !== undefined) {
    const markupVal = String(Number(special_markup_percent) || 0);
    await query("UPDATE settings SET value = $1, updated_at = $2 WHERE key = 'special_markup_percent'", [markupVal, now]);
  }

  if (rounding_step !== undefined) {
    const roundVal = String(Number(rounding_step) || 1);
    await query("UPDATE settings SET value = $1, updated_at = $2 WHERE key = 'rounding_step'", [roundVal, now]);
  }

  // Recalculate all non-overridden dishes and variants
  const result = await recalculateAllNonOverriddenPrices();

  return res.json({
    success: true,
    message: `Pricing settings saved. Updated ${result.updatedDishes} dish(es) and ${result.updatedVariants} variant(s).`,
  });
});

// ============================================================================
// 10. DATA EXPORT (JSON content, CSV scans & review events)
// ============================================================================
router.get('/export/content', async (req, res) => {
  const categories = await query('SELECT * FROM categories');
  const dishes = await query('SELECT * FROM dishes WHERE deleted_at IS NULL');
  const dishVariants = await query('SELECT * FROM dish_variants');
  const dishImages = await query('SELECT * FROM dish_images');
  const popularDishes = await query('SELECT * FROM popular_dishes');
  const galleryItems = await query('SELECT * FROM gallery_items');
  const siteContent = await query('SELECT * FROM site_content');
  const legalPages = await query('SELECT * FROM legal_pages');
  const seoPages = await query('SELECT * FROM seo_pages');
  const reviewOptions = await query('SELECT * FROM review_options');

  const exportData = {
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

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="amol-content-export-${Date.now()}.json"`);
  return res.send(JSON.stringify(exportData, null, 2));
});

router.get('/export/scans', async (req, res) => {
  const { from, to } = req.query;
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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="scan-analytics-${Date.now()}.csv"`);
  return res.send(csv);
});

router.get('/export/reviews', async (req, res) => {
  const { from, to } = req.query;
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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="review-events-${Date.now()}.csv"`);
  return res.send(csv);
});

export default router;


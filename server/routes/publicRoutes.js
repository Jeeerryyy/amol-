import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';
import { query } from '../db/connection.js';
import { env } from '../config/env.js';
import { checkQrRateLimit, checkContactRateLimit } from '../middleware/rateLimiter.js';
import { REVIEW_CONFIG } from '../../review.config.js';
import { contactInquirySchema } from '../validation/schemas.js';

const router = express.Router();

// In-memory cache for public endpoints (~60s TTL)
const cache = new Map();
function getCached(key) {
  const item = cache.get(key);
  if (item && item.expiresAt > Date.now()) return item.data;
  return null;
}
function setCached(key, data, ttlSeconds = 60) {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function clearPublicCache(key) {
  if (key) {
    for (const k of cache.keys()) {
      if (k.includes(key)) cache.delete(k);
    }
  } else {
    cache.clear();
  }
}

function sendCachedJson(res, data, ttlSeconds = 60) {
  const jsonStr = JSON.stringify(data);
  const etag = `"${crypto.createHash('md5').update(jsonStr).digest('hex')}"`;
  res.setHeader('Cache-Control', `public, max-age=${Math.min(30, ttlSeconds)}, stale-while-revalidate=${ttlSeconds * 2}`);
  res.setHeader('ETag', etag);
  if (res.req?.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.type('application/json');
  return res.send(jsonStr);
}

export function invalidatePublicCache() {
  cache.clear();
}

// Validate dynamic redirect URL scheme (blocks javascript:, data:, vbscript:, protocol-relative //)
function isSafeRedirectDestination(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  if (trimmed.startsWith('//')) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  // Bare relative path without colon/scheme (e.g. 'menu/')
  return !/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

// Device, OS, Browser detection helper
function parseUserAgent(ua = '') {
  const lower = ua.toLowerCase();

  let device_type = 'Desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(lower)) {
    if (/ipad|tablet/i.test(lower)) {
      device_type = 'Tablet';
    } else if (/iphone|ipod/i.test(lower)) {
      device_type = 'iOS';
    } else if (/android/i.test(lower)) {
      device_type = 'Android';
    } else {
      device_type = 'Mobile';
    }
  }

  let os = 'Other';
  if (/android/i.test(lower)) os = 'Android';
  else if (/iphone|ipad|ipod|cpu iphone os/i.test(lower)) os = 'iOS';
  else if (/windows nt/i.test(lower)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(lower)) os = 'macOS';
  else if (/linux/i.test(lower)) os = 'Linux';

  let browser = 'Other';
  if (/chrome|crios/i.test(lower) && !/edg|opr/i.test(lower)) browser = 'Chrome';
  else if (/safari/i.test(lower) && !/chrome|crios|android/i.test(lower)) browser = 'Safari';
  else if (/firefox|fxios/i.test(lower)) browser = 'Firefox';
  else if (/edg/i.test(lower)) browser = 'Edge';

  return { device_type, os, browser };
}

// Helper function to safely escape HTML in fallback pages
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Render branded, high-performance HTML fallback page
function renderQrFallbackPage({
  statusTitle,
  message,
  badgeText = 'Notice',
  primaryBtnText = 'Browse Digital Menu',
  primaryBtnHref = '/menu/',
  secondaryBtnText = 'Visit Homepage',
  secondaryBtnHref = '/',
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(statusTitle)} | Amol Veg Resto</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #FAF4EC;
      color: #2B170B;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .fallback-card {
      background: #FFFFFF;
      max-width: 440px;
      width: 100%;
      border-radius: 20px;
      padding: 36px 28px;
      border: 1.5px solid #E8DACB;
      box-shadow: 0 10px 30px rgba(43, 23, 11, 0.08);
      text-align: center;
    }
    .brand-eyebrow {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C85A17;
      margin-bottom: 12px;
    }
    .status-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 99px;
      background: #FEE2E2;
      color: #991B1B;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 750;
      color: #2B170B;
      line-height: 1.3;
      margin-bottom: 12px;
    }
    p {
      font-size: 14.5px;
      line-height: 1.6;
      color: #6B5545;
      margin-bottom: 24px;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      display: inline-block;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 650;
      border-radius: 99px;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }
    .btn-primary {
      background-color: #2B170B;
      color: #FAF4EC;
    }
    .btn-secondary {
      background-color: #FAF4EC;
      color: #C85A17;
      border: 1px solid #E8DACB;
    }
    .btn:hover { opacity: 0.9; }
    .footer-help {
      margin-top: 20px;
      font-size: 12.5px;
      color: #8C705F;
    }
    .footer-help a {
      color: #C85A17;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="fallback-card">
    <div class="brand-eyebrow">Amol Veg Resto · Solapur</div>
    <div><span class="status-badge">${escapeHtml(badgeText)}</span></div>
    <h1>${escapeHtml(statusTitle)}</h1>
    <p>${message}</p>
    <div class="btn-group">
      <a href="${escapeHtml(primaryBtnHref)}" class="btn btn-primary">${escapeHtml(primaryBtnText)}</a>
      <a href="${escapeHtml(secondaryBtnHref)}" class="btn btn-secondary">${escapeHtml(secondaryBtnText)}</a>
    </div>
    <div class="footer-help">
      Need assistance? Call our staff at <a href="tel:+917249664983">+91 72496 64983</a>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 1. DYNAMIC QR SCAN REDIRECT (/qr/:code and /q/:code)
// Permanent dynamic redirect URL encoded once, destination fully editable anytime.
// ============================================================================
async function handleDynamicQrRedirect(req, res) {
  const rawCode = req.params.code || '';
  const code = rawCode.trim().toLowerCase();
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const ua = req.get('user-agent') || '';

  // 1. Rate limiting check
  if (!checkQrRateLimit(clientIp)) {
    return res.status(429).send('Too many requests. Please slow down.');
  }

  try {
    const qrs = await query('SELECT * FROM qr_codes WHERE slug = $1 OR id = $1', [code]);

    if (qrs.length === 0) {
      // Unknown code -> Render clean fallback 404 page
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(404).send(
        renderQrFallbackPage({
          statusTitle: 'QR Code Not Found',
          message: `The scanned QR link (<strong>/qr/${escapeHtml(code)}</strong>) is not registered or has been moved.`,
          badgeText: '404 · Unregistered QR',
          primaryBtnText: 'Browse Digital Menu',
          primaryBtnHref: '/menu/',
          secondaryBtnText: 'Visit Homepage',
          secondaryBtnHref: '/',
        })
      );
    }

    const qr = qrs[0];

    // Check if QR code is paused/disabled
    if (!qr.is_enabled) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(503).send(
        renderQrFallbackPage({
          statusTitle: 'QR Stand Temporarily Paused',
          message: `The <strong>${escapeHtml(qr.label || 'service')}</strong> QR stand is temporarily paused by our restaurant staff. Please ask our staff for assistance or browse our menu on our website.`,
          badgeText: 'Temporarily Inactive',
          primaryBtnText: 'Browse Digital Menu',
          primaryBtnHref: '/menu/',
          secondaryBtnText: 'Visit Homepage',
          secondaryBtnHref: '/',
        })
      );
    }

    // Check if destination is empty or missing
    if (!qr.destination || !qr.destination.trim()) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(200).send(
        renderQrFallbackPage({
          statusTitle: 'Destination In Progress',
          message: `The destination link for <strong>${escapeHtml(qr.label)}</strong> is currently being configured. Please check back in a few moments or ask our team.`,
          badgeText: 'Setup In Progress',
          primaryBtnText: 'Browse Digital Menu',
          primaryBtnHref: '/menu/',
          secondaryBtnText: 'Visit Homepage',
          secondaryBtnHref: '/',
        })
      );
    }

    // 2. Scan Logging: Log every scan (time, device) before redirecting
    try {
      const { device_type, os, browser } = parseUserAgent(ua);
      const scanId = `scan_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const timestamp = new Date().toISOString();
      const ipHash = crypto.createHash('sha256').update(`${clientIp}:${ua}:${env.ipHashSalt || 'salt'}`).digest('hex');

      // Fast non-blocking query to record scan without delaying customer redirect
      query(
        'INSERT INTO scans (id, qr_id, ip_hash, device_type, os, browser, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [scanId, qr.id, ipHash, device_type, os, browser, timestamp]
      ).catch((err) => console.error('[QR Scan Log Error]', err));
    } catch (logErr) {
      console.error('[QR Scan Parse Error]', logErr);
    }

    // 3. Fast 302 Redirect (<150ms response) with Cache-Control: no-store
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    let destination = qr.destination.trim();
    if (!isSafeRedirectDestination(destination)) {
      destination = '/menu/';
    } else if (!/^https?:\/\//i.test(destination)) {
      if (!destination.startsWith('/') && !destination.startsWith('#')) {
        destination = `/${destination}`;
      }
    }

    return res.redirect(302, destination);
  } catch (err) {
    console.error('[QR Redirect Error]', err);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.redirect(302, '/menu/');
  }
}

router.get('/qr/:code', handleDynamicQrRedirect);
router.get('/q/:code', handleDynamicQrRedirect);

// ============================================================================
// 2. PUBLIC SITE METADATA & CONTENT (/api/public/site)
// ============================================================================
router.get('/api/public/site', async (req, res, next) => {
  const cached = getCached('site_content');
  if (cached) return sendCachedJson(res, cached);

  try {
    const contentRows = await query('SELECT * FROM site_content');
    const siteData = {};
    for (const r of contentRows) {
      try {
        siteData[r.key] = JSON.parse(r.data);
      } catch {
        siteData[r.key] = r.data;
      }
    }

    const seoRows = await query('SELECT * FROM seo_pages');
    const seoData = {};
    for (const s of seoRows) {
      seoData[s.id] = s;
    }

    const payload = {
      content: siteData,
      seo: seoData,
    };

    setCached('site_content', payload, 60);
    return sendCachedJson(res, payload);
  } catch (err) {
    console.warn('[Public API] Database unavailable for /api/public/site, serving static fallback');
    return res.json({
      content: {
        contact: {
          phone: "+91 72496 64983",
          alternate_phone: "+91 81491 73027",
          email: "owner@amolvegresto.in",
          address: "Gala No 2, Plot 16/1, Karnik Nagar Rd, Sakhar Peth, Solapur, Maharashtra 413006",
          hours: "11:00 AM – 11:30 PM",
          whatsapp: "+91 72496 64983",
          maps_url: "https://maps.app.goo.gl/zp7RDvhrkJNiTKri9"
        }
      },
      seo: {}
    });
  }
});

// ============================================================================
// 3. PUBLIC POPULAR DISHES (/api/public/popular-dishes)
// ============================================================================
router.get('/api/public/popular-dishes', async (req, res, next) => {
  const cached = getCached('popular_dishes');
  if (cached) return sendCachedJson(res, cached);

  try {
    const dishes = await query('SELECT * FROM popular_dishes WHERE is_visible = 1 ORDER BY sort_order ASC');
    setCached('popular_dishes', dishes, 60);
    return sendCachedJson(res, dishes);
  } catch (err) {
    console.warn('[Public API] Database unavailable for /api/public/popular-dishes, serving fallback dishes');
    return res.json([
      { id: "pop-1", title: "Crispy Chilli Paneer", name: "Crispy Chilli Paneer", price: "₹150", description: "Fresh cottage cheese cubes tossed with bell peppers & spicy garlic sauce.", imageSrc: "/images/dishes/popular/dish-1.jpg", image_url: "/images/dishes/popular/dish-1.jpg" },
      { id: "pop-2", title: "Paneer Butter Masala", name: "Paneer Butter Masala", price: "₹180", description: "Rich tomato, butter and cashew nut gravy finished with fresh cream.", imageSrc: "/images/dishes/popular/dish-2.jpg", image_url: "/images/dishes/popular/dish-2.jpg" },
      { id: "pop-3", title: "Solapuri Shev Bhaji", name: "Solapuri Shev Bhaji", price: "₹130", description: "Authentic Solapur spicy red gravy topped with crisp gram flour sev.", imageSrc: "/images/dishes/popular/dish-3.jpg", image_url: "/images/dishes/popular/dish-3.jpg" },
      { id: "pop-4", title: "Special Veg Thali", name: "Special Veg Thali", price: "₹220", description: "Complete traditional feast with fresh rotis, seasonal curries, dal and rice.", imageSrc: "/images/dishes/popular/dish-4.jpg", image_url: "/images/dishes/popular/dish-4.jpg" }
    ]);
  }
});

// ============================================================================
// 4. PUBLIC GALLERY (/api/public/gallery)
// ============================================================================
router.get('/api/public/gallery', async (req, res, next) => {
  const cached = getCached('gallery');
  if (cached) return sendCachedJson(res, cached);

  try {
    const items = await query('SELECT * FROM gallery_items WHERE is_visible = 1 ORDER BY sort_order ASC, created_at DESC');
    setCached('gallery', items, 60);
    return sendCachedJson(res, items);
  } catch (err) {
    console.warn('[Public API] Database unavailable for /api/public/gallery, serving fallback gallery');
    return res.json([]);
  }
});

// ============================================================================
// 5. PUBLIC MENU (/api/public/menu/:menuId) - 'main' | 'special'
// ============================================================================
router.get('/api/public/menu/:menuId', async (req, res, next) => {
  const menuId = req.params.menuId === 'special' ? 'special' : 'main';
  const cacheKey = `menu_${menuId}`;

  const cached = getCached(cacheKey);
  if (cached) return sendCachedJson(res, cached);

  try {
    const [menuDetails] = await query('SELECT * FROM menus WHERE id = $1', [menuId]);

    let dishSql = `
      SELECT id, name, description, category_id, serving_note, price_type,
             ${menuId === 'special' ? 'special_price AS price' : 'base_price AS price'},
             tags, spice_level, badges, is_available, sort_order
      FROM dishes
      WHERE is_visible = 1 AND deleted_at IS NULL
    `;

    if (menuId === 'main') {
      dishSql += " AND scope = 'both'";
    } else {
      dishSql += " AND scope IN ('both', 'special_only')";
    }

    dishSql += ' ORDER BY sort_order ASC, created_at DESC';

    const dishes = await query(dishSql);

    // Batch fetch images & variants
    const allImages = await query('SELECT dish_id, url FROM dish_images ORDER BY sort_order ASC');
    const imageMap = new Map();
    for (const img of allImages) {
      if (!imageMap.has(img.dish_id)) imageMap.set(img.dish_id, []);
      imageMap.get(img.dish_id).push(img.url);
    }

    const variantSql = `
      SELECT dish_id, id, label, ${menuId === 'special' ? 'special_price AS price' : 'base_price AS price'}, sort_order
      FROM dish_variants
      ORDER BY sort_order ASC
    `;
    const allVariants = await query(variantSql);
    const variantMap = new Map();
    for (const v of allVariants) {
      if (!variantMap.has(v.dish_id)) variantMap.set(v.dish_id, []);
      variantMap.get(v.dish_id).push(v);
    }

    const categoryIdsWithDishes = new Set();
    for (const d of dishes) {
      categoryIdsWithDishes.add(d.category_id);
      d.images = imageMap.get(d.id) || [];
      d.variants = d.price_type === 'variants' ? (variantMap.get(d.id) || []) : [];

      try {
        d.tags = typeof d.tags === 'string' ? JSON.parse(d.tags || '[]') : (d.tags || []);
        d.badges = typeof d.badges === 'string' ? JSON.parse(d.badges || '[]') : (d.badges || []);
      } catch {
        d.tags = [];
        d.badges = [];
      }
    }

    const allCategories = await query('SELECT * FROM categories WHERE visible = 1 ORDER BY sort_order ASC');
    const categories = allCategories.filter((cat) => categoryIdsWithDishes.has(cat.id));

    const [seo] = await query('SELECT * FROM seo_pages WHERE id = $1', [menuId === 'special' ? 'special-menu' : 'menu']);
    const buttons = await query('SELECT * FROM menu_buttons WHERE is_enabled = 1 ORDER BY sort_order ASC');

    const payload = {
      menu: menuDetails || {
        id: menuId,
        title: menuId === 'special' ? 'Special Menu' : 'Menu',
        subtitle: menuId === 'special' ? 'Exclusive Dining Delights' : 'Pure Vegetarian Delights',
        video_url: '/menu/hero-video.mp4',
        poster_url: '',
      },
      categories,
      dishes,
      buttons: buttons || [],
      seo: seo || {
        title: menuId === 'special' ? 'Special Menu | Amol Veg Resto' : 'Menu | Amol Veg Resto',
        meta_description: 'Pure vegetarian dining at Amol Veg Resto.',
        noindex: menuId === 'special' ? 1 : 0,
      },
    };

    setCached(cacheKey, payload, 60);
    return sendCachedJson(res, payload);
  } catch (err) {
    console.warn(`[Public API] Database unavailable for /api/public/menu/${menuId}, serving local menu data:`, err.message);
    try {
      const fallbackPath = path.resolve('public/menu/restaurant_menu_data.json');
      if (fs.existsSync(fallbackPath)) {
        const raw = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        return res.json({
          menu: {
            id: menuId,
            title: menuId === 'special' ? 'Special Menu' : 'Menu',
            subtitle: menuId === 'special' ? 'Exclusive Dining Delights' : 'Pure Vegetarian Delights',
            video_url: '/menu/hero-video.mp4',
            poster_url: '',
          },
          categories: raw.categories || [],
          dishes: raw.dishes || [],
          buttons: [
            { id: 'btn_whatsapp', type: 'whatsapp', label: 'Order via WhatsApp', phone: '+91 72496 64983', bg_color: '#1E7B46', hover_color: '#ea580c', is_enabled: 1, sort_order: 1 },
            { id: 'btn_waiter', type: 'call_waiter', label: 'Call Waiter', bg_color: '#2B170B', hover_color: '#C04A0C', is_enabled: 1, sort_order: 2 }
          ],
          seo: {
            title: menuId === 'special' ? 'Special Menu | Amol Veg Resto' : 'Menu | Amol Veg Resto',
            meta_description: 'Pure vegetarian dining at Amol Veg Resto.',
            noindex: menuId === 'special' ? 1 : 0,
          },
        });
      }
    } catch (e) {
      console.error('[Public API] Fallback menu load error:', e);
    }
    return res.status(503).json({ error: 'Menu temporarily unavailable' });
  }
});

// ============================================================================
// 5B. PUBLIC MENU ACTION BUTTONS (/api/public/menu-buttons)
// ============================================================================
router.get('/api/public/menu-buttons', async (req, res) => {
  // Always set real-time cache headers so browser fetches latest customizations
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const buttons = await query('SELECT * FROM menu_buttons WHERE is_enabled = 1 ORDER BY sort_order ASC, created_at ASC');
    return res.json(buttons || []);
  } catch (err) {
    console.warn('[Public API] Database error for menu buttons, fallback:', err.message);
    return res.json([
      { id: 'btn_whatsapp', type: 'whatsapp', label: 'Order via WhatsApp', phone: '+91 72496 64983', bg_color: '#1E7B46', hover_color: '#ea580c', is_enabled: 1, sort_order: 1 },
      { id: 'btn_waiter', type: 'call_waiter', label: 'Call Waiter', bg_color: '#2B170B', hover_color: '#C04A0C', is_enabled: 1, sort_order: 2 }
    ]);
  }
});

// ============================================================================
// 6. PUBLIC REVIEW CONFIG (/api/public/review-config)
// ============================================================================
router.get('/api/public/review-config', async (req, res, next) => {
  const cached = getCached('review_config');
  if (cached) return sendCachedJson(res, cached);

  try {
    const [googleLinkRow] = await query("SELECT value FROM review_settings WHERE key = 'google_review_url'");
    const options = await query('SELECT id, label, positive_only, ai_hint FROM review_options WHERE is_visible = 1 ORDER BY sort_order ASC');

    const payload = {
      googleReviewUrl: googleLinkRow?.value || REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      google_review_url: googleLinkRow?.value || REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      options: options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        positiveOnly: Boolean(opt.positive_only),
        aiHint: opt.ai_hint || '',
      })),
    };

    setCached('review_config', payload, 60);
    return sendCachedJson(res, payload);
  } catch (err) {
    console.error('[Public API] Review config fallback to defaults:', err);
    return sendCachedJson(res, {
      googleReviewUrl: REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      options: REVIEW_CONFIG.OPTIONS,
    });
  }
});

// ============================================================================
// 7. PUBLIC REVIEW EVENTS (POST /api/public/review-events)
// ============================================================================
const reviewEventsLimiter = new Map();
function checkReviewEventsRateLimit(ip) {
  const now = Date.now();
  let hits = reviewEventsLimiter.get(ip) || [];
  hits = hits.filter((t) => now - t < 60000);
  if (hits.length >= 30) return false;
  hits.push(now);
  reviewEventsLimiter.set(ip, hits);
  return true;
}

router.post('/api/public/review-events', async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    if (!checkReviewEventsRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Rate limit reached' });
    }

    const { type, stars, optionIds } = req.body || {};
    if (!type || !['started', 'submitted'].includes(type)) {
      return res.status(400).json({ error: "Invalid event type: must be 'started' or 'submitted'" });
    }

    const ua = req.get('user-agent') || '';
    const { device_type } = parseUserAgent(ua);
    const eventId = `rev_ev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const starNum =
      stars !== undefined && stars !== null && Number.isInteger(Number(stars)) && Number(stars) >= 1 && Number(stars) <= 5
        ? Number(stars)
        : null;
    const safeOptionIds = Array.isArray(optionIds)
      ? JSON.stringify(optionIds.filter((id) => typeof id === 'string').slice(0, 15))
      : null;

    await query(
      'INSERT INTO review_events (id, event_type, stars, option_ids, device_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [eventId, type, starNum, safeOptionIds, device_type, now]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[Public API] Error recording review event:', err);
    return res.status(500).json({ error: 'Failed to record review event' });
  }
});

// ============================================================================
// 8. PUBLIC LEGAL PAGES (/api/public/legal/:id)
// ============================================================================
router.get('/api/public/legal/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const pages = await query('SELECT * FROM legal_pages WHERE id = $1', [id]);
    if (pages.length === 0) return res.status(404).json({ error: 'Page not found' });
    return sendCachedJson(res, pages[0], 300);
  } catch (err) {
    console.warn(`[Public API] Database unavailable for /api/public/legal/${id}, serving fallback`);
    return sendCachedJson(res, {
      id,
      title: id === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions',
      content_html: `<p>Welcome to Amol Veg Resto. For any questions regarding our policies, please contact +91 72496 64983.</p>`
    }, 300);
  }
});

// ============================================================================
// 9. PUBLIC CONTACT INQUIRY SUBMISSION (/api/public/contact)
// ============================================================================
router.post('/api/public/contact', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    if (!checkContactRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many inquiries submitted. Please call +91 72496 64983 or try again in a few minutes.' });
    }

    const parsed = contactInquirySchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || 'Please complete all required inquiry fields.' });
    }

    const cleanName = sanitizeHtml(parsed.data.name, { allowedTags: [], allowedAttributes: {} }).trim();
    const cleanPhone = sanitizeHtml(parsed.data.phone, { allowedTags: [], allowedAttributes: {} }).trim();
    const cleanEmail = sanitizeHtml(parsed.data.email || '', { allowedTags: [], allowedAttributes: {} }).trim();
    const cleanMessage = sanitizeHtml(parsed.data.message, { allowedTags: [], allowedAttributes: {} }).trim();

    if (!cleanName || !cleanMessage) {
      return res.status(400).json({ error: 'Please enter valid text for your name and message.' });
    }

    const id = `inq_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const now = new Date().toISOString();

    await query(
      'INSERT INTO contact_inquiries (id, name, phone, email, message, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, cleanName, cleanPhone, cleanEmail || null, cleanMessage, 'new', now]
    );

    return res.status(201).json({
      success: true,
      id,
      message: 'Thank you! Your inquiry has been received by our restaurant team.',
    });
  } catch (err) {
    console.error('[Public API] Failed to save contact inquiry:', err);
    return res.status(500).json({ error: 'Unable to submit inquiry right now. Please call +91 72496 64983.' });
  }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { REVIEW_CONFIG } from '../../review.config.js';

const router = express.Router();

const IP_HASH_SALT = process.env.IP_HASH_SALT || 'amol_qr_salt_secure_2026';

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

export function invalidatePublicCache() {
  cache.clear();
}

// In-memory QR scan dedupe map: key is `hash:qrId` -> timestamp
const scanDedupeMap = new Map();

// In-memory rate limiter for /q/:code (30/min per IP)
const qrIpLimiter = new Map();
function checkQrRateLimit(ip) {
  const now = Date.now();
  let hits = qrIpLimiter.get(ip) || [];
  hits = hits.filter((t) => now - t < 60000);
  if (hits.length >= 30) return false;
  hits.push(now);
  qrIpLimiter.set(ip, hits);
  return true;
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

function isBot(ua = '') {
  const botPatterns = /bot|crawl|spider|preview|facebookexternalhit|slackbot|whatsapp|telegrambot|twitterbot|pinterest/i;
  return botPatterns.test(ua);
}

// ============================================================================
// 1. DYNAMIC QR SCAN REDIRECT (/q/:code)
// ============================================================================
router.get('/q/:code', async (req, res) => {
  const { code } = req.params;
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const ua = req.get('user-agent') || '';

  // Fail-safe default destinations
  const fallbackDestinations = {
    menu: '/menu/',
    special: '/special-menu/',
  };

  // 1. Rate limiting check
  if (!checkQrRateLimit(clientIp)) {
    return res.status(429).send('Too many requests. Please slow down.');
  }

  try {
    const qrs = await query('SELECT * FROM qr_codes WHERE id = $1', [code]);
    if (qrs.length === 0) {
      // Unknown code -> redirect to main menu
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.redirect(302, fallbackDestinations[code] || '/menu/');
    }

    const qr = qrs[0];

    // If QR code is disabled, show friendly unavailable page
    if (!qr.is_enabled) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(503).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Menu Currently Unavailable | Amol Veg Resto</title>
          <style>
            body { font-family: sans-serif; background: #FAF4EC; color: #2B170B; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: white; padding: 36px 28px; border-radius: 16px; box-shadow: 0 4px 20px rgba(43,23,11,0.08); max-width: 420px; border: 1px solid #E8DACB; }
            h2 { color: #C85A17; margin-top: 0; }
            p { color: #6B5545; line-height: 1.5; }
            a { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #2B170B; color: white; border-radius: 99px; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Menu Temporarily Offline</h2>
            <p>This digital menu QR code is currently inactive. Please ask our restaurant staff for assistance or visit our main website.</p>
            <a href="/">Go to Homepage</a>
          </div>
        </body>
        </html>
      `);
    }

    // 2. Asynchronous Scan Logging (Non-blocking)
    if (!isBot(ua) && req.method !== 'HEAD') {
      const ipHash = crypto.createHash('sha256').update(`${clientIp}:${ua}:${IP_HASH_SALT}`).digest('hex');
      const dedupeKey = `${ipHash}:${code}`;
      const lastScan = scanDedupeMap.get(dedupeKey);
      const now = Date.now();

      // Dedupe same hash within 30s
      if (!lastScan || now - lastScan > 30000) {
        scanDedupeMap.set(dedupeKey, now);
        const { device_type, os, browser } = parseUserAgent(ua);
        const scanId = `scan_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const timestamp = new Date().toISOString();

        // Non-blocking query execution
        query(
          'INSERT INTO scans (id, qr_id, ip_hash, device_type, os, browser, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [scanId, code, ipHash, device_type, os, browser, timestamp]
        ).catch((err) => console.error('[QR Scan Log Error]', err));
      }
    }

    // 3. Fast 302 Redirect (<150ms response) with Cache-Control: no-store
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const destination = qr.destination.startsWith('/') ? qr.destination : `/${qr.destination}`;
    return res.redirect(302, destination);
  } catch (err) {
    console.error('[QR Redirect Error]', err);
    // If DB is down, still redirect gracefully!
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, fallbackDestinations[code] || '/menu/');
  }
});

// ============================================================================
// 2. PUBLIC SITE METADATA & CONTENT (/api/public/site)
// ============================================================================
router.get('/api/public/site', async (req, res) => {
  const cached = getCached('site_content');
  if (cached) return res.json(cached);

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
    return res.json(payload);
  } catch (err) {
    console.error('[Public API] Error loading site data:', err);
    return res.status(500).json({ error: 'Failed to load site data' });
  }
});

// ============================================================================
// 3. PUBLIC POPULAR DISHES (/api/public/popular-dishes)
// ============================================================================
router.get('/api/public/popular-dishes', async (req, res) => {
  const cached = getCached('popular_dishes');
  if (cached) return res.json(cached);

  try {
    const dishes = await query('SELECT * FROM popular_dishes WHERE is_visible = 1 ORDER BY sort_order ASC');
    setCached('popular_dishes', dishes, 60);
    return res.json(dishes);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load popular dishes' });
  }
});

// ============================================================================
// 4. PUBLIC GALLERY (/api/public/gallery)
// ============================================================================
router.get('/api/public/gallery', async (req, res) => {
  const cached = getCached('gallery');
  if (cached) return res.json(cached);

  try {
    const items = await query('SELECT * FROM gallery_items WHERE is_visible = 1 ORDER BY sort_order ASC, created_at DESC');
    setCached('gallery', items, 60);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load gallery' });
  }
});

// ============================================================================
// 5. PUBLIC MENU (/api/public/menu/:menuId) - 'main' | 'special'
// ============================================================================
router.get('/api/public/menu/:menuId', async (req, res) => {
  const menuId = req.params.menuId === 'special' ? 'special' : 'main';
  const cacheKey = `menu_${menuId}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    // 1. Get menu details (title, subtitle, video, poster)
    const [menuDetails] = await query('SELECT * FROM menus WHERE id = $1', [menuId]);

    // 2. Query dishes based on scope
    // Main menu: scope = 'both'
    // Special menu: scope IN ('both', 'special_only')
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

    // 3. Enrich dishes with images & variants
    const categoryIdsWithDishes = new Set();
    for (const d of dishes) {
      categoryIdsWithDishes.add(d.category_id);
      d.images = (await query('SELECT url FROM dish_images WHERE dish_id = $1 ORDER BY sort_order ASC', [d.id])).map(
        (img) => img.url
      );

      if (d.price_type === 'variants') {
        const variantSql = `
          SELECT id, label, ${menuId === 'special' ? 'special_price AS price' : 'base_price AS price'}, sort_order
          FROM dish_variants
          WHERE dish_id = $1
          ORDER BY sort_order ASC
        `;
        d.variants = await query(variantSql, [d.id]);
      } else {
        d.variants = [];
      }

      try {
        d.tags = JSON.parse(d.tags || '[]');
        d.badges = JSON.parse(d.badges || '[]');
      } catch {
        d.tags = [];
        d.badges = [];
      }
    }

    // 4. Categories: Auto-hide categories with 0 visible dishes in this menu!
    const allCategories = await query('SELECT * FROM categories WHERE visible = 1 ORDER BY sort_order ASC');
    const categories = allCategories.filter((cat) => categoryIdsWithDishes.has(cat.id));

    // 5. SEO Page meta
    const [seo] = await query('SELECT * FROM seo_pages WHERE id = $1', [menuId === 'special' ? 'special-menu' : 'menu']);

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
      seo: seo || {
        title: menuId === 'special' ? 'Special Menu | Amol Veg Resto' : 'Menu | Amol Veg Resto',
        meta_description: 'Pure vegetarian dining at Amol Veg Resto.',
        noindex: menuId === 'special' ? 1 : 0,
      },
    };

    setCached(cacheKey, payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error('[Public API] Error loading menu:', err);
    return res.status(500).json({ error: 'Failed to load menu' });
  }
});

// ============================================================================
// 6. PUBLIC REVIEW CONFIG (/api/public/review-config)
// ============================================================================
router.get('/api/public/review-config', async (req, res) => {
  const cached = getCached('review_config');
  if (cached) return res.json(cached);

  try {
    const [googleLinkRow] = await query("SELECT value FROM review_settings WHERE key = 'google_review_url'");
    const options = await query('SELECT id, label, positive_only, ai_hint FROM review_options WHERE is_visible = 1 ORDER BY sort_order ASC');

    const payload = {
      googleReviewUrl: googleLinkRow?.value || REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      options: options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        positiveOnly: Boolean(opt.positive_only),
        aiHint: opt.ai_hint || '',
      })),
    };

    setCached('review_config', payload, 60);
    return res.json(payload);
  } catch (err) {
    console.error('[Public API] Review config fallback to defaults:', err);
    // Graceful fallback to bundled defaults so customer review flow NEVER breaks!
    return res.json({
      googleReviewUrl: REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      options: REVIEW_CONFIG.OPTIONS,
    });
  }
});

// ============================================================================
// 7. PUBLIC REVIEW EVENTS (POST /api/public/review-events)
// ============================================================================
// Rate limiter for review events (30/min per IP)
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

router.post('/api/public/review-events', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
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

  // Validate stars if submitted
  const starNum = stars !== undefined && stars !== null ? Number(stars) : null;
  const safeOptionIds = Array.isArray(optionIds) ? JSON.stringify(optionIds.slice(0, 15)) : null;

  try {
    await query(
      'INSERT INTO review_events (id, event_type, stars, option_ids, device_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [eventId, type, starNum, safeOptionIds, device_type, now]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[Public API] Failed to log review event:', err);
    return res.status(500).json({ error: 'Failed to record event' });
  }
});

// ============================================================================
// 8. PUBLIC LEGAL PAGES (/api/public/legal/:id)
// ============================================================================
router.get('/api/public/legal/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pages = await query('SELECT * FROM legal_pages WHERE id = $1', [id]);
    if (pages.length === 0) return res.status(404).json({ error: 'Page not found' });
    return res.json(pages[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load legal page' });
  }
});

export default router;

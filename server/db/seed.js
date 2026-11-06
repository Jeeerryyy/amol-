import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query } from './connection.js';
import { runMigrations } from './migrations.js';
import { env } from '../config/env.js';
import { REVIEW_CONFIG } from '../../review.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  await runMigrations();

  console.log('[Seed] Checking and seeding database...');
  const now = new Date().toISOString();

  // 1. SEED OWNER ONLY IF NONE EXISTS (prevents resetting owner's password on server restart!)
  const existingOwners = await query('SELECT id, email FROM owner LIMIT 1');
  if (existingOwners.length === 0) {
    const adminEmail = env.adminEmail;
    const adminPassword = env.adminInitialPassword;
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const ownerId = 'owner_1';

    await query(
      'INSERT INTO owner (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
      [ownerId, adminEmail, passwordHash, now, now]
    );
    console.log(`[Seed] Seeded initial owner account: ${adminEmail}`);
  } else {
    console.log(`[Seed] Owner account already present (${existingOwners[0].email}). Password preserved.`);
  }

  // 2. SEED SETTINGS (Pricing)
  const defaultSettings = [
    { key: 'special_markup_percent', value: '10' },
    { key: 'rounding_step', value: '1' },
    { key: 'restaurant_name', value: 'Amol Veg Resto' },
  ];
  for (const s of defaultSettings) {
    const existing = await query('SELECT key FROM settings WHERE key = $1', [s.key]);
    if (existing.length === 0) {
      await query('INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)', [s.key, s.value, now]);
    }
  }

  // 3. SEED QR CODES
  const defaultQRs = [
    { id: 'menu', label: 'Main Menu', destination: '/menu', is_enabled: 1 },
    { id: 'special', label: 'Special Menu', destination: '/special-menu', is_enabled: 1 },
  ];
  for (const qr of defaultQRs) {
    const existing = await query('SELECT id FROM qr_codes WHERE id = $1', [qr.id]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO qr_codes (id, label, destination, is_enabled, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [qr.id, qr.label, qr.destination, qr.is_enabled, now, now]
      );
    }
  }

  // 4. SEED MENUS
  const defaultMenus = [
    {
      id: 'main',
      title: 'Menu',
      subtitle: 'Pure Vegetarian Delights',
      video_url: '/menu/hero-video.mp4',
      video_public_id: null,
      poster_url: '',
      poster_public_id: null,
    },
    {
      id: 'special',
      title: 'Special Menu',
      subtitle: 'Exclusive Dining & Chef Specials',
      video_url: '/menu/hero-video.mp4',
      video_public_id: null,
      poster_url: '',
      poster_public_id: null,
    },
  ];
  for (const m of defaultMenus) {
    const existing = await query('SELECT id FROM menus WHERE id = $1', [m.id]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO menus (id, title, subtitle, video_url, video_public_id, poster_url, poster_public_id, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [m.id, m.title, m.subtitle, m.video_url, m.video_public_id, m.poster_url, m.poster_public_id, now]
      );
    }
  }

  // 5. SEED REVIEW SETTINGS & OPTIONS
  const existingGoogleUrl = await query("SELECT value FROM review_settings WHERE key = 'google_review_url'");
  if (existingGoogleUrl.length === 0) {
    await query("INSERT INTO review_settings (key, value, updated_at) VALUES ('google_review_url', $1, $2)", [
      REVIEW_CONFIG.GOOGLE_REVIEW_URL,
      now,
    ]);
  }

  const existingOptions = await query('SELECT id FROM review_options');
  if (existingOptions.length === 0) {
    let sortOrder = 1;
    for (const opt of REVIEW_CONFIG.OPTIONS) {
      await query(
        'INSERT INTO review_options (id, label, positive_only, ai_hint, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          opt.id,
          opt.label,
          opt.positiveOnly ? 1 : 0,
          opt.aiHint || '',
          1,
          sortOrder++,
          now,
          now,
        ]
      );
    }
  }

  // 6. SEED SITE CONTENT & LEGAL & SEO
  const defaultLegal = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      content_html: `
        <h2>Privacy Policy for Amol Veg Resto</h2>
        <p>Last updated: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        <p>At Amol Veg Resto, we take privacy seriously. When you use our digital menu or leave a review, we collect minimal data required to provide a seamless dining experience.</p>
        <h3>Information We Collect</h3>
        <p>We do not collect names, credit card numbers, or personal identifying information on our public digital menu. We record anonymous QR scan metrics (device type, operating system, and visit timestamp) to optimize service speed.</p>
        <h3>Contact & Inquiries</h3>
        <p>For any questions regarding privacy, please contact us at owner@amolvegresto.in or call our restaurant counter.</p>
      `,
    },
    {
      id: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content_html: `
        <h2>Terms & Conditions</h2>
        <p>Last updated: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        <p>Welcome to Amol Veg Resto. By accessing our website and digital paper menu, you agree to comply with and be bound by the following terms.</p>
        <h3>Menu Pricing & Availability</h3>
        <p>All prices listed on our digital menu are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices and dish availability are subject to change without notice based on fresh market produce.</p>
        <h3>Pure Vegetarian Guarantee</h3>
        <p>Amol Veg Resto strictly operates a 100% pure vegetarian kitchen facility with separate handling and clean hygiene standards.</p>
      `,
    },
  ];

  for (const lp of defaultLegal) {
    const existing = await query('SELECT id FROM legal_pages WHERE id = $1', [lp.id]);
    if (existing.length === 0) {
      await query('INSERT INTO legal_pages (id, title, content_html, updated_at) VALUES ($1, $2, $3, $4)', [
        lp.id,
        lp.title,
        lp.content_html.trim(),
        now,
      ]);
    }
  }

  const defaultSeo = [
    {
      id: 'home',
      title: 'Amol Veg Resto | Best Pure Veg Restaurant in Solapur',
      meta_description: 'Authentic 100% pure vegetarian dining in Sakhar Peth, Solapur. South Indian dosas, rich North Indian curries, Chinese, Punjabi thalis & mocktails.',
      og_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      noindex: 0,
    },
    {
      id: 'menu',
      title: 'Digital Menu & Prices | Amol Veg Resto Solapur',
      meta_description: 'Explore 280+ pure vegetarian delicacies at Amol Veg Resto Solapur. Crisp dosas, rich thalis, paneer curries, sandwiches & Chinese. View latest rates.',
      og_image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      noindex: 0,
    },
    {
      id: 'special-menu',
      title: 'Special Menu | Amol Veg Resto Solapur',
      meta_description: 'Exclusive Dining Delights and Chef Specials at Amol Veg Resto Solapur.',
      og_image_url: '',
      noindex: 1, // Hidden from search engine crawlers
    },
  ];

  for (const s of defaultSeo) {
    const existing = await query('SELECT id FROM seo_pages WHERE id = $1', [s.id]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO seo_pages (id, title, meta_description, og_image_url, noindex, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [s.id, s.title, s.meta_description, s.og_image_url, s.noindex, now]
      );
    }
  }

  // 7. SEED INITIAL DISHES & CATEGORIES FROM restaurant_menu_data.json IF EMPTY
  const dishCount = await query('SELECT COUNT(*) as count FROM dishes');
  if (Number(dishCount[0]?.count || 0) === 0) {
    const menuDataFile = path.resolve(__dirname, '../../public/menu/restaurant_menu_data.json');
    if (fs.existsSync(menuDataFile)) {
      try {
        const rawJson = JSON.parse(fs.readFileSync(menuDataFile, 'utf8'));
        const cats = rawJson.categories || [];
        const dishList = rawJson.dishes || [];

        console.log(`[Seed] Ingesting ${cats.length} categories and ${dishList.length} dishes from JSON...`);

        let catOrder = 1;
        for (const cat of cats) {
          const catId = cat.id || `cat_${catOrder}`;
          const catName = cat.name || cat;
          await query(
            'INSERT INTO categories (id, name, description, visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [catId, catName, '', 1, catOrder++, now, now]
          );
        }

        let dishOrder = 1;
        for (const d of dishList) {
          const dishId = d.id || `dish_${dishOrder}`;
          const price = Number(d.price || d.base_price || 100);
          const markup = 10;
          const specialPrice = Math.round((price * (1 + markup / 100)));

          await query(
            `INSERT INTO dishes (
              id, name, description, category_id, serving_note, price_type,
              base_price, special_price, special_price_override,
              tags, spice_level, badges, is_available, is_visible, scope, sort_order,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
              dishId,
              d.name,
              d.description || '',
              d.category_id || (cats[0]?.id || 'cat_1'),
              d.serving_note || '',
              d.variants && d.variants.length > 0 ? 'variants' : 'single',
              price,
              specialPrice,
              null,
              JSON.stringify(d.tags || ['veg']),
              d.spice_level || 'none',
              JSON.stringify(d.badges || []),
              d.is_available !== undefined ? (d.is_available ? 1 : 0) : 1,
              1,
              'both',
              dishOrder++,
              now,
              now,
            ]
          );

          if (d.image) {
            await query(
              'INSERT INTO dish_images (id, dish_id, public_id, url, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [`img_${dishId}_1`, dishId, null, d.image, 1, 1, now]
            );
          }

          if (d.variants && Array.isArray(d.variants)) {
            let vOrder = 1;
            for (const v of d.variants) {
              const vPrice = Number(v.price || v.base_price || price);
              const vSpecial = Math.round(vPrice * 1.1);
              await query(
                'INSERT INTO dish_variants (id, dish_id, label, base_price, special_price, special_price_override, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [`var_${dishId}_${vOrder}`, dishId, v.name || v.label, vPrice, vSpecial, null, vOrder++, now]
              );
            }
          }
        }
        console.log(`[Seed] Ingestion completed with ${dishList.length} menu items.`);
      } catch (e) {
        console.error('[Seed Error] Failed to parse menu json:', e);
      }
    }
  }

  console.log('[Seed] Database initialization complete.');
}

export default seedDatabase;


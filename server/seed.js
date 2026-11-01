import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { runMigrations } from './migrations.js';
import { REVIEW_CONFIG } from '../review.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  await runMigrations();

  console.log('[Seed] Checking and seeding database...');
  const now = new Date().toISOString();

  // 1. SEED OWNER
  const existingOwners = await query('SELECT id FROM owner LIMIT 1');
  if (existingOwners.length === 0) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'owner@amolvegresto.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@12345';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const ownerId = 'owner_1';

    await query(
      'INSERT INTO owner (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
      [ownerId, adminEmail, passwordHash, now, now]
    );
    console.log(`[Seed] Seeded owner account: ${adminEmail}`);
  } else {
    console.log('[Seed] Owner account already exists. Skipping owner seeding.');
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
  const existingRevUrl = await query("SELECT key FROM review_settings WHERE key = 'google_review_url'");
  if (existingRevUrl.length === 0) {
    await query(
      'INSERT INTO review_settings (key, value, updated_at) VALUES ($1, $2, $3)',
      ['google_review_url', REVIEW_CONFIG.GOOGLE_REVIEW_URL, now]
    );
  }

  const existingOptions = await query('SELECT id FROM review_options');
  if (existingOptions.length === 0) {
    let order = 0;
    for (const opt of REVIEW_CONFIG.OPTIONS) {
      await query(
        'INSERT INTO review_options (id, label, positive_only, ai_hint, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [opt.id, opt.label, opt.positiveOnly ? 1 : 0, '', 1, order++, now, now]
      );
    }
    console.log(`[Seed] Seeded ${REVIEW_CONFIG.OPTIONS.length} review options.`);
  }

  // 6. SEED CATEGORIES & DISHES FROM restaurant_menu_data.json
  const menuDataPath = path.resolve(__dirname, '../public/menu/restaurant_menu_data.json');
  if (fs.existsSync(menuDataPath)) {
    const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

    // Categories
    const categories = menuData.categories || ['Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts'];
    for (let i = 0; i < categories.length; i++) {
      const catName = categories[i];
      const catId = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const existing = await query('SELECT id FROM categories WHERE name = $1', [catName]);
      if (existing.length === 0) {
        await query(
          'INSERT INTO categories (id, name, description, visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [catId, catName, `${catName} selection`, 1, i, now, now]
        );
      }
    }

    // Dishes
    const dishes = menuData.dishes || [];
    for (let i = 0; i < dishes.length; i++) {
      const d = dishes[i];
      const dishId = `dish_${d.id}`;
      const existing = await query('SELECT id FROM dishes WHERE id = $1', [dishId]);
      if (existing.length === 0) {
        const catId = d.category ? d.category.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'starters';
        const basePrice = Number(d.price) || 0;
        // 10% markup default rounded to 1
        const specialPrice = Math.round(basePrice * 1.10);

        let badges = [];
        if (d.tag) {
          if (d.tag.toLowerCase().includes('chef')) badges.push("Chef's Special");
          else if (d.tag.toLowerCase().includes('loved') || d.tag.toLowerCase().includes('favourite')) badges.push("Best Seller");
          else badges.push(d.tag);
        }

        const tags = JSON.stringify(['veg']);

        await query(
          `INSERT INTO dishes (
            id, name, description, category_id, serving_note, price_type, base_price, special_price, special_price_override,
            tags, spice_level, badges, is_available, is_visible, scope, sort_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            dishId,
            d.name,
            d.description || '',
            catId,
            '',
            'single',
            basePrice,
            specialPrice,
            null,
            tags,
            'medium',
            JSON.stringify(badges),
            1,
            1,
            'both',
            i,
            now,
            now,
          ]
        );

        // Images
        if (Array.isArray(d.images)) {
          for (let imgIdx = 0; imgIdx < d.images.length; imgIdx++) {
            const imgUrl = d.images[imgIdx];
            const imgId = `${dishId}_img_${imgIdx}`;
            await query(
              'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
              [imgId, dishId, null, imgUrl, 1000, 800, imgIdx, imgIdx === 0 ? 1 : 0, now]
            );
          }
        }
      }
    }
    console.log(`[Seed] Seeded ${dishes.length} menu dishes with categories and images.`);
  }

  // 7. SEED POPULAR DISHES
  const existingPop = await query('SELECT id FROM popular_dishes');
  if (existingPop.length === 0) {
    const popularDishesSeed = [
      { id: 'pop-1', title: 'Crispy Chilli Paneer', description: 'Fresh cottage cheese cubes tossed with bell peppers & spicy garlic sauce.', price: '₹150' },
      { id: 'pop-2', title: 'Paneer Butter Masala', description: 'Rich tomato, butter and cashew nut gravy finished with fresh cream.', price: '₹180' },
      { id: 'pop-3', title: 'Solapuri Shev Bhaji', description: 'Authentic Solapur spicy red gravy topped with crisp gram flour sev.', price: '₹130' },
      { id: 'pop-4', title: 'Special Veg Thali', description: 'Complete traditional feast with fresh rotis, seasonal curries, dal and rice.', price: '₹220' },
    ];
    for (let i = 0; i < popularDishesSeed.length; i++) {
      const p = popularDishesSeed[i];
      await query(
        'INSERT INTO popular_dishes (id, title, description, price, image_url, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [p.id, p.title, p.description, p.price, '', 1, i, now, now]
      );
    }
  }

  // 8. SEED GALLERY ITEMS
  const existingGal = await query('SELECT id FROM gallery_items');
  if (existingGal.length === 0) {
    const gallerySeed = [
      { id: 'gal-1', url: '/images/amol-sketch.jpg', alt_text: 'Amol Veg Resto Front Architectural Sketch', caption: 'Serving Solapur authentic pure veg delights since 1990.', category: 'ambience', aspect: 'wide' },
      { id: 'gal-2', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=85', alt_text: 'Crisp Golden Masala Dosa', caption: 'Ritual morning dosa served sizzling hot with coconut chutney & sambar.', category: 'food', aspect: 'wide' },
      { id: 'gal-3', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85', alt_text: 'Air-Conditioned Family Dining Hall', caption: 'Spotless, spacious and comfortable seating designed for family meals.', category: 'ambience', aspect: 'wide' },
      { id: 'gal-4', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85', alt_text: 'Ritual Kitchen Tadka & Fresh Cooking', caption: 'Prepared daily with pure ingredients and zero compromise.', category: 'kitchen', aspect: 'standard' },
    ];
    for (let i = 0; i < gallerySeed.length; i++) {
      const g = gallerySeed[i];
      await query(
        'INSERT INTO gallery_items (id, url, alt_text, caption, category, aspect, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [g.id, g.url, g.alt_text, g.caption, g.category, g.aspect, 1, i, now, now]
      );
    }
  }

  // 9. SEED SITE CONTENT (Contact, Social, Footer, FSSAI)
  const contactSocialData = {
    phones: ['+91 72496 64983', '+91 98765 43210'],
    address: '123, Station Road, Sakhar Peth, Solapur, Maharashtra - 413001',
    directions_url: 'https://maps.app.goo.gl/zp7RDvhrkJNiTKri9',
    opening_hours_text: 'Opens 12 PM',
    weekly_hours: 'Monday – Sunday: 11:30 AM – 11:00 PM',
    socials: {
      instagram: '',
      facebook: '',
      whatsapp: 'https://wa.me/917249664983',
      youtube: '',
    },
  };
  const footerFssaiData = {
    tagline: 'Pure veg food, fresh and served fast.',
    copyright: '© 2026 Amol Veg Resto. All rights reserved.',
    fssai_licence: '', // Empty -> keeps "[TO BE ADDED]" behavior as required
  };

  const existingContact = await query("SELECT key FROM site_content WHERE key = 'contact_social'");
  if (existingContact.length === 0) {
    await query(
      'INSERT INTO site_content (key, data, updated_at) VALUES ($1, $2, $3)',
      ['contact_social', JSON.stringify(contactSocialData), now]
    );
  }

  const existingFooter = await query("SELECT key FROM site_content WHERE key = 'footer_fssai'");
  if (existingFooter.length === 0) {
    await query(
      'INSERT INTO site_content (key, data, updated_at) VALUES ($1, $2, $3)',
      ['footer_fssai', JSON.stringify(footerFssaiData), now]
    );
  }

  // 10. SEED LEGAL PAGES
  const legalPages = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      content_html: `
        <h2>Privacy Policy</h2>
        <p><em>Last updated: November 2026</em></p>
        <p><strong>TODO: replace with reviewed legal text.</strong></p>
        <p>Amol Veg Resto ("we", "our", or "us") values your privacy. This policy outlines how information is handled when you browse our website, view our digital menu, or share reviews.</p>
        <h3>Information We Collect</h3>
        <p>We do not collect personal identifiers from website visitors unless voluntarily provided. When accessing our digital menu via QR codes, anonymous device and browser type may be logged for service analytics.</p>
        <h3>Third-Party Services</h3>
        <p>Our review system enables visitors to post ratings directly to Google Reviews. We do not store your private Google credentials or review contents on our servers.</p>
      `,
    },
    {
      id: 'terms-and-conditions',
      title: 'Terms and Conditions',
      content_html: `
        <h2>Terms and Conditions</h2>
        <p><em>Last updated: November 2026</em></p>
        <p><strong>TODO: replace with reviewed legal text.</strong></p>
        <p>Welcome to Amol Veg Resto. By accessing our website, viewing our digital menus, or dining with us, you agree to comply with and be bound by the following terms.</p>
        <h3>Menu Pricing and Availability</h3>
        <p>Dishes, prices, and special offers listed on our digital menus are subject to daily kitchen availability and seasonal ingredient changes. Taxes are applicable as per local regulations.</p>
        <h3>Restaurant Hygiene & Dining</h3>
        <p>We take pride in maintaining 100% pure vegetarian preparation standards. Please inform our service team in advance regarding any special dietary or Jain requirements.</p>
      `,
    },
  ];
  for (const lp of legalPages) {
    const existing = await query('SELECT id FROM legal_pages WHERE id = $1', [lp.id]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO legal_pages (id, title, content_html, updated_at) VALUES ($1, $2, $3, $4)',
        [lp.id, lp.title, lp.content_html.trim(), now]
      );
    }
  }

  // 11. SEED SEO PAGES
  const seoPages = [
    {
      id: 'home',
      title: 'Amol Veg Resto | Pure Veg Restaurant in Sakhar Peth, Solapur',
      meta_description: 'Pure vegetarian restaurant in Sakhar Peth, Solapur serving fresh, tasty South Indian delicacies, hearty lunch thalis and authentic flavors since 1990.',
      og_image_url: '',
      noindex: 0,
    },
    {
      id: 'menu',
      title: 'Menu | Amol Veg Resto - Pure Vegetarian Delights',
      meta_description: 'Explore our complete pure vegetarian menu featuring crispy dosas, sizzling starters, paneer specialties, thalis, fresh breads and desserts.',
      og_image_url: '',
      noindex: 0,
    },
    {
      id: 'special-menu',
      title: 'Special Menu | Amol Veg Resto',
      meta_description: 'Exclusive dining specials and chef signature delicacies at Amol Veg Resto.',
      og_image_url: '',
      noindex: 1, // Default ON as required
    },
  ];
  for (const sp of seoPages) {
    const existing = await query('SELECT id FROM seo_pages WHERE id = $1', [sp.id]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO seo_pages (id, title, meta_description, og_image_url, noindex, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [sp.id, sp.title, sp.meta_description, sp.og_image_url, sp.noindex, now]
      );
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Done.');
    process.exit(0);
  }).catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}


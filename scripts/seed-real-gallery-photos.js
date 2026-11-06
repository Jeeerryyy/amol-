import { query } from '../server/db/connection.js';

async function main() {
  console.log('[Gallery Seed] Checking current gallery_items in database...');
  const current = await query('SELECT * FROM gallery_items ORDER BY sort_order ASC');
  console.log(`[Gallery Seed] Found ${current.length} existing items.`);

  const photos = [
    {
      id: 'gal-1',
      url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Crisp Golden Masala Dosa with Coconut Chutney',
      caption: 'Ritual morning delicacies served sizzling hot with authentic chutneys.',
      category: 'food',
      aspect: 'wide',
      sort_order: 1,
      is_visible: 1,
    },
    {
      id: 'gal-2',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Air-Conditioned Family Dining Hall',
      caption: 'Spotless, spacious and comfortable seating designed for family meals.',
      category: 'ambiance',
      aspect: 'wide',
      sort_order: 2,
      is_visible: 1,
    },
    {
      id: 'gal-3',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Ritual Kitchen Tadka & Fresh Indian Cooking',
      caption: 'Prepared daily with pure ingredients, whole spices and zero compromise.',
      category: 'kitchen',
      aspect: 'wide',
      sort_order: 3,
      is_visible: 1,
    },
    {
      id: 'gal-4',
      url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Authentic Solapuri Special Thali',
      caption: 'Hearty vegetarian feast with warm rotis, curries, bhakri and dal.',
      category: 'food',
      aspect: 'standard',
      sort_order: 4,
      is_visible: 1,
    },
    {
      id: 'gal-5',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Steaming Brass Davara South Indian Filter Coffee',
      caption: 'Aromatic South Indian filter coffee brewed fresh in authentic brass cups.',
      category: 'food',
      aspect: 'standard',
      sort_order: 5,
      is_visible: 1,
    },
    {
      id: 'gal-6',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Warm Hospitality & Clean Family Dining',
      caption: 'Fast, caring service making every workday lunch and family dinner special.',
      category: 'ambiance',
      aspect: 'standard',
      sort_order: 6,
      is_visible: 1,
    },
    {
      id: 'gal-7',
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&auto=format&fit=crop&q=80',
      alt_text: 'Fresh Tandoor Roti & Pure Vegetarian Delicacies',
      caption: 'Crisp tandoori rotis and rich paneer curries prepared fresh to order.',
      category: 'food',
      aspect: 'standard',
      sort_order: 7,
      is_visible: 1,
    },
  ];

  const now = new Date().toISOString();

  for (const p of photos) {
    const existing = await query('SELECT id FROM gallery_items WHERE id = $1', [p.id]);
    if (existing.length > 0) {
      await query(
        'UPDATE gallery_items SET url = $1, alt_text = $2, caption = $3, category = $4, aspect = $5, is_visible = $6, sort_order = $7, updated_at = $8 WHERE id = $9',
        [p.url, p.alt_text, p.caption, p.category, p.aspect, p.is_visible, p.sort_order, now, p.id]
      );
      console.log(`[Gallery Seed] Updated ${p.id} (${p.alt_text})`);
    } else {
      await query(
        'INSERT INTO gallery_items (id, url, public_id, alt_text, caption, category, aspect, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [p.id, p.url, null, p.alt_text, p.caption, p.category, p.aspect, p.is_visible, p.sort_order, now, now]
      );
      console.log(`[Gallery Seed] Inserted ${p.id} (${p.alt_text})`);
    }
  }

  const all = await query('SELECT id, alt_text, url, category, aspect, is_visible, sort_order FROM gallery_items ORDER BY sort_order ASC');
  console.log(`[Gallery Seed] Total photos in database: ${all.length}`);
  console.table(all);
  process.exit(0);
}

main().catch(err => {
  console.error('[Gallery Seed Error]', err);
  process.exit(1);
});


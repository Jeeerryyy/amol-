import fs from 'fs';
import path from 'path';
import { query } from '../server/db/connection.js';

function walkDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walkDir(full));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

async function run() {
  const allImageFiles = walkDir('public/images/dishes').map(f => {
    const rel = f.replace(/\\/g, '/').replace(/^public\//, '/');
    return {
      relPath: rel,
      fileName: path.basename(f),
      baseSlug: path.basename(f, path.extname(f)).toLowerCase(),
      categoryFolder: path.basename(path.dirname(f)).toLowerCase()
    };
  });

  console.log(`Found ${allImageFiles.length} dish image files in public/images/dishes`);

  const menuDataPath = 'public/menu/restaurant_menu_data.json';
  const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

  const specialOverrides = {
    3: 'grill-sandwich/corn-cheese-sandwich.png',
    4: 'grill-sandwich/veg-mayonnaise-sandwich.png',
    6: 'grill-sandwich/club-cheese-sandwich.png',
    64: 'paneer-starters/paneer-hot-garlic-sauce.png',
    106: 'soup/hot-and-sour-veg-soup.png',
    280: 'ice-cream-cold-drinks/cold-drinks-250ml.png'
  };

  let matchedCount = 0;
  const mappedDishes = [];

  for (const dish of menuData.dishes) {
    let matchedRel = null;

    if (specialOverrides[dish.id]) {
      const target = '/images/dishes/' + specialOverrides[dish.id];
      const exists = allImageFiles.find(img => img.relPath === target);
      if (exists) {
        matchedRel = exists.relPath;
      }
    }

    if (!matchedRel) {
      const dishSlug = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const catSlug = (dish.category_id || dish.category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // 1. Try category + slug
      let found = allImageFiles.find(img => img.categoryFolder === catSlug && img.baseSlug === dishSlug);

      // 2. Try just baseSlug in any category
      if (!found) {
        found = allImageFiles.find(img => img.baseSlug === dishSlug);
      }

      // 3. Try fuzzy contains
      if (!found) {
        found = allImageFiles.find(img => img.baseSlug.includes(dishSlug) || dishSlug.includes(img.baseSlug));
      }

      if (found) {
        matchedRel = found.relPath;
      }
    }

    if (matchedRel) {
      dish.images = [matchedRel];
      matchedCount++;
      mappedDishes.push({ id: dish.id, name: dish.name, img: matchedRel });
    } else {
      console.warn(`Unmatched dish ID ${dish.id}: "${dish.name}" in category "${dish.category}"`);
    }
  }

  console.log(`Successfully mapped ${matchedCount} / ${menuData.dishes.length} dishes to real images!`);

  if (matchedCount === menuData.dishes.length) {
    fs.writeFileSync(menuDataPath, JSON.stringify(menuData, null, 2), 'utf8');
    console.log('Updated public/menu/restaurant_menu_data.json');

    // Update SQLite database
    console.log('Updating SQLite database dish_images table...');
    for (const d of mappedDishes) {
      const dishDbId = `dish_${d.id}`;
      // Check if dish image exists
      const existing = await query('SELECT id FROM dish_images WHERE dish_id = $1', [dishDbId]);
      if (existing && existing.length > 0) {
        await query('UPDATE dish_images SET url = $1 WHERE dish_id = $2', [d.img, dishDbId]);
      } else {
        const imgId = `${dishDbId}_img_0`;
        const now = new Date().toISOString();
        await query(
          'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, null, $3, 400, 300, 0, 1, $4)',
          [imgId, dishDbId, d.img, now]
        );
      }
    }
    console.log('Updated SQLite dish_images table for all 280 dishes!');

    // Update popular dishes images
    const popDishes = await query('SELECT * FROM popular_dishes');
    for (const pop of popDishes) {
      if (pop.id === 'pop-1') await query("UPDATE popular_dishes SET image_url = '/images/dishes/popular/dish-1.jpg' WHERE id = 'pop-1'");
      if (pop.id === 'pop-2') await query("UPDATE popular_dishes SET image_url = '/images/dishes/popular/dish-2.jpg' WHERE id = 'pop-2'");
      if (pop.id === 'pop-3') await query("UPDATE popular_dishes SET image_url = '/images/dishes/popular/dish-3.jpg' WHERE id = 'pop-3'");
      if (pop.id === 'pop-4') await query("UPDATE popular_dishes SET image_url = '/images/dishes/popular/dish-4.jpg' WHERE id = 'pop-4'");
    }
    console.log('Updated popular_dishes with /images/dishes/popular/dish-1..4.jpg');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Error running map script:', err);
  process.exit(1);
});

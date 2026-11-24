import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dishesDir = path.resolve(__dirname, '../public/images/dishes');

function getDishImages(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getDishImages(full));
    } else if (/\.(png|jpg|jpeg)$/i.test(file) && !/\.webp$/i.test(file)) {
      results.push(full);
    }
  }
  return results;
}

async function optimizeAll() {
  console.log('========================================================================');
  console.log('STARTING AUTOMATED DISH IMAGE OPTIMIZATION (PNG -> WEBP 400x300)');
  console.log('========================================================================');

  const files = getDishImages(dishesDir);
  console.log(`Found ${files.length} dish images to optimize.`);

  if (files.length === 0) {
    console.log('No unoptimized PNG/JPG images found in public/images/dishes.');
    return;
  }

  let totalOldBytes = 0;
  for (const f of files) {
    totalOldBytes += fs.statSync(f).size;
  }
  console.log(`Initial total size: ${(totalOldBytes / (1024 * 1024)).toFixed(2)} MB`);

  console.log('Launching headless browser canvas worker...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let convertedCount = 0;
  let totalNewBytes = 0;
  const startT = performance.now();

  // Process in batches of 10 for speed and low memory
  const BATCH_SIZE = 10;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    for (const srcPath of batch) {
      try {
        const ext = path.extname(srcPath);
        const webpPath = srcPath.slice(0, -ext.length) + '.webp';

        const buf = fs.readFileSync(srcPath);
        const mime = ext.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        const dataUri = `data:${mime};base64,${buf.toString('base64')}`;

        const webpDataUrl = await page.evaluate(async (uri) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              // 400x300 aspect ratio matches 4:3 dish card box
              canvas.width = 400;
              canvas.height = 300;
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/webp', 0.82));
            };
            img.onerror = () => reject(new Error('Failed to load image in canvas'));
            img.src = uri;
          });
        }, dataUri);

        const base64Data = webpDataUrl.replace(/^data:image\/webp;base64,/, '');
        const webpBuf = Buffer.from(base64Data, 'base64');

        if (webpBuf.length > 500) {
          fs.writeFileSync(webpPath, webpBuf);
          totalNewBytes += webpBuf.length;
          convertedCount++;

          // Safely delete original bulky PNG/JPG
          fs.unlinkSync(srcPath);
        }
      } catch (err) {
        console.error(`Error converting ${srcPath}:`, err.message);
      }
    }

    const elapsedSec = ((performance.now() - startT) / 1000).toFixed(1);
    const progress = Math.min(i + BATCH_SIZE, files.length);
    console.log(`[${progress}/${files.length}] Optimized ${convertedCount} images... (${elapsedSec}s)`);
  }

  await browser.close();

  const totalSavedMb = ((totalOldBytes - totalNewBytes) / (1024 * 1024)).toFixed(2);
  const newSizeMb = (totalNewBytes / (1024 * 1024)).toFixed(2);
  console.log('------------------------------------------------------------------------');
  console.log(`CONVERSION COMPLETE!`);
  console.log(`Processed: ${convertedCount} images`);
  console.log(`Old size: ${(totalOldBytes / (1024 * 1024)).toFixed(2)} MB -> New size: ${newSizeMb} MB`);
  console.log(`Total bandwidth saved: ${totalSavedMb} MB (${(((totalOldBytes - totalNewBytes) / totalOldBytes) * 100).toFixed(1)}% reduction!)`);
  console.log('------------------------------------------------------------------------');

  // Update public/menu/restaurant_menu_data.json to point to .webp
  const jsonPath = path.resolve(__dirname, '../public/menu/restaurant_menu_data.json');
  if (fs.existsSync(jsonPath)) {
    let jsonStr = fs.readFileSync(jsonPath, 'utf8');
    jsonStr = jsonStr.replace(/\/images\/dishes\/([^"'\s]+)\.(png|jpg|jpeg)/gi, '/images/dishes/$1.webp');
    fs.writeFileSync(jsonPath, jsonStr, 'utf8');
    console.log('[JSON] Updated public/menu/restaurant_menu_data.json image paths to .webp');
  }

  // Update scripts/category-dish-breakdown.json
  const breakdownPath = path.resolve(__dirname, 'category-dish-breakdown.json');
  if (fs.existsSync(breakdownPath)) {
    let breakdownStr = fs.readFileSync(breakdownPath, 'utf8');
    breakdownStr = breakdownStr.replace(/\/images\/dishes\/([^"'\s]+)\.(png|jpg|jpeg)/gi, '/images/dishes/$1.webp');
    fs.writeFileSync(breakdownPath, breakdownStr, 'utf8');
    console.log('[JSON] Updated scripts/category-dish-breakdown.json image paths to .webp');
  }

  // Update SQLite database dish_images table
  const dbPath = path.resolve(__dirname, '../data/restaurant.db');
  if (fs.existsSync(dbPath)) {
    const db = new DatabaseSync(dbPath);
    const dishImages = db.prepare('SELECT id, url FROM dish_images').all();
    const updateStmt = db.prepare('UPDATE dish_images SET url = ? WHERE id = ?');
    let dbUpdated = 0;
    for (const img of dishImages) {
      if (img.url && /\.(png|jpg|jpeg)$/i.test(img.url)) {
        const newUrl = img.url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        updateStmt.run(newUrl, img.id);
        dbUpdated++;
      }
    }
    console.log(`[DB] Updated ${dbUpdated} records in SQLite dish_images table to .webp`);
  }

  console.log('[SUCCESS] All menu dish images are now high-performance, lightweight WebP!');
}

optimizeAll().catch(err => {
  console.error('Fatal error during optimization:', err);
  process.exit(1);
});

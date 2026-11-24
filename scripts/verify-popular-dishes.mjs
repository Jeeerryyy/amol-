import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { db } from '../server/db/connection.js';

async function main() {
  console.log('--- STEP 1: Updating and Verifying Database Sort Order ---');
  await db.query('UPDATE popular_dishes SET sort_order = 1 WHERE id = ?', ['pop-1']);
  await db.query('UPDATE popular_dishes SET sort_order = 2 WHERE id = ?', ['pop-2']);
  await db.query('UPDATE popular_dishes SET sort_order = 3 WHERE id = ?', ['pop-3']);
  await db.query('UPDATE popular_dishes SET sort_order = 4 WHERE id = ?', ['pop-4']);
  
  const rows = await db.query('SELECT id, title, sort_order, price, image_url FROM popular_dishes ORDER BY sort_order ASC');
  console.log('Database rows:', rows);

  console.log('\n--- STEP 2: Verifying Image Files on Disk ---');
  for (const row of rows) {
    const relPath = row.image_url.startsWith('/') ? row.image_url.slice(1) : row.image_url;
    const fullPath = path.resolve(process.cwd(), 'public', relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing image file on disk: ${fullPath}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`Image [${row.title}]: ${relPath} - ${stat.size} bytes (OK)`);
    if (stat.size < 50000) {
      throw new Error(`Image file too small (${stat.size} bytes): ${fullPath}`);
    }
  }

  console.log('\n--- STEP 3: Verifying Public API Response ---');
  const res = await fetch('http://localhost:3001/api/public/popular-dishes');
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  const apiDishes = await res.json();
  console.log(`API returned ${apiDishes.length} dishes:`);
  apiDishes.forEach((d, idx) => {
    console.log(`  ${idx + 1}. [${d.id}] ${d.title} (${d.price}) -> ${d.image_url}`);
  });

  if (apiDishes.length !== 4) {
    throw new Error(`Expected 4 dishes, got ${apiDishes.length}`);
  }

  console.log('\n--- STEP 4: Playwright Browser Test (Desktop & Mobile) ---');
  const browser = await chromium.launch({ headless: true });
  
  // Desktop test
  {
    console.log('\nTesting Desktop Viewport (1280x800)...');
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Check popular dishes section
    const section = page.locator('#popular-dishes');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const isVisible = await section.isVisible();
    console.log(`Desktop popular dishes section visible: ${isVisible}`);

    // Check visible desktop grid images
    const desktopGrid = section.locator('.desktop-dishes-grid');
    const images = await desktopGrid.locator('img.dish-img').all();
    console.log(`Found ${images.length} images in desktop dishes grid.`);
    if (images.length !== 4) {
      throw new Error(`Expected 4 images in desktop grid, found ${images.length}`);
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      // Wait for image to load completely
      await img.evaluate(async (el) => {
        if (!el.complete) {
          await new Promise((resolve) => {
            el.onload = resolve;
            el.onerror = resolve;
          });
        }
      });

      const imgStatus = await img.evaluate((el) => ({
        complete: el.complete,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight
      }));
      console.log(`  Desktop Dish #${i + 1} [alt="${alt}"] src="${src}": complete=${imgStatus.complete}, size=${imgStatus.naturalWidth}x${imgStatus.naturalHeight}`);
      if (!imgStatus.complete || imgStatus.naturalWidth === 0) {
        throw new Error(`Desktop image failed to load: ${src}`);
      }
    }

    // Capture desktop screenshot
    await section.screenshot({ path: 'public/popular-dishes-desktop.png' });
    console.log('Saved screenshot to public/popular-dishes-desktop.png');
    await page.close();
  }

  // Mobile test
  {
    console.log('\nTesting Mobile Viewport (390x844)...');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    const section = page.locator('#popular-dishes');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const isVisible = await section.isVisible();
    console.log(`Mobile popular dishes section visible: ${isVisible}`);

    const mobileWrap = section.locator('.mobile-dishes-carousel-wrap');
    const images = await mobileWrap.locator('img.stacked-card-img').all();
    console.log(`Found ${images.length} images in mobile stacked carousel.`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');

      await img.evaluate(async (el) => {
        if (!el.complete) {
          await new Promise((resolve) => {
            el.onload = resolve;
            el.onerror = resolve;
          });
        }
      });

      const imgStatus = await img.evaluate((el) => ({
        complete: el.complete,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight
      }));
      console.log(`  Mobile Dish #${i + 1} [alt="${alt}"] src="${src}": complete=${imgStatus.complete}, size=${imgStatus.naturalWidth}x${imgStatus.naturalHeight}`);
      if (!imgStatus.complete || imgStatus.naturalWidth === 0) {
        throw new Error(`Mobile image failed to load: ${src}`);
      }
    }

    // Test swiping the carousel to next dish
    const nextBtn = mobileWrap.locator('.stacked-nav-btn.btn-next');
    await nextBtn.click();
    await page.waitForTimeout(500);

    await section.screenshot({ path: 'public/popular-dishes-mobile.png' });
    console.log('Saved screenshot to public/popular-dishes-mobile.png');
    await page.close();
  }

  await browser.close();
  console.log('\nAll popular dishes verifications PASSED successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('baseline-screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'phone-360', width: 360, height: 780, isMobile: true, hasTouch: true },
  { name: 'phone-390', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'phone-412', width: 412, height: 915, isMobile: true, hasTouch: true },
];

const PAGES = [
  { slug: 'home', url: 'http://localhost:5173/' },
  { slug: 'menu', url: 'http://localhost:5173/menu/' },
  { slug: 'special-menu', url: 'http://localhost:5173/special-menu' },
  { slug: 'review', url: 'http://localhost:5173/#/review' },
  { slug: 'about', url: 'http://localhost:5173/#/about' },
  { slug: 'gallery', url: 'http://localhost:5173/#/gallery' },
  { slug: 'contact', url: 'http://localhost:5173/#/contact' },
  { slug: 'privacy-policy', url: 'http://localhost:5173/#/privacy-policy' },
  { slug: 'terms-and-conditions', url: 'http://localhost:5173/#/terms-and-conditions' },
  { slug: '404', url: 'http://localhost:5173/random-404-check' },
];

async function capture() {
  console.log('Capturing baseline screenshots for visual regression reference...');
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\nViewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      try {
        await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await page.waitForTimeout(600);
        const filePath = path.join(OUT_DIR, `${p.slug}_${vp.name}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`  ✓ Captured: ${p.slug}_${vp.name}.png`);
      } catch (err) {
        console.warn(`  ✗ Failed ${p.slug} at ${vp.name}:`, err.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('\nAll baseline screenshots saved in baseline-screenshots/');
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

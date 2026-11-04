/**
 * Permanent Smoke Test Suite for CI / Regression Testing
 * Critical Path Verification (<30 seconds execution)
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3001';

async function runSmokeTests() {
  console.log('\n--- STARTING AMOL VEG RESTO SMOKE TESTS ---');
  const t0 = Date.now();
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(12000);

    // 1. Home loads cleanly
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const brandTitle = await page.locator('.navbar-brand-text .navbar-title').textContent().catch(() => '');
    assert(brandTitle.includes('Amol'), `1. Homepage loads with brand header "${brandTitle.trim()}"`);

    // 2. Menu loads with dishes
    await page.goto(`${BASE_URL}/menu/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.menu-dish-card', { timeout: 15000 });
    const dishCardsCount = await page.locator('.menu-dish-card').count();
    assert(dishCardsCount >= 20, `2. Main menu displays all ${dishCardsCount} dishes`);

    // 3. Category switch
    const startersTab = page.locator('.category-tab-btn:has-text("Starters")').first();
    await startersTab.click();
    await page.waitForTimeout(300);
    const startersCount = await page.locator('.menu-dish-card').count();
    assert(startersCount > 0 && startersCount < dishCardsCount, `3. Category tab switches and filters (${startersCount} dishes)`);

    // 4. Search filter
    const searchInput = page.locator('#searchInput').first();
    await searchInput.fill('Paneer');
    await page.waitForTimeout(300);
    const searchCount = await page.locator('.menu-dish-card').count();
    assert(searchCount > 0, `4. Live search filters to "${searchCount}" matching items`);

    // 5. Dish modal opens
    const firstDish = page.locator('.menu-dish-card').first();
    await firstDish.click();
    await page.waitForTimeout(300);
    const isModalOpen = await page.locator('#dishModal').evaluate((el) => el.classList.contains('open')).catch(() => false);
    assert(isModalOpen, '5. Dish detail modal opens on click');
    await page.locator('#dishModal .modal-close-btn').click();
    await page.waitForTimeout(200);

    // 6. Review page loads and accepts input
    await page.goto(`${BASE_URL}/#/review`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    await page.locator('button.star-btn').nth(4).click({ force: true });
    await page.waitForTimeout(300);
    await page.locator('button.option-chip').first().click({ force: true });
    await page.waitForTimeout(300);
    const reviewVal = await page.locator('textarea.review-textarea').inputValue();
    assert(reviewVal.length > 5, '6. Review system generates instant local draft');

    // 7. QR Redirect
    const qrRes = await fetch(`${API_URL}/q/menu`, { redirect: 'manual' });
    const location = qrRes.headers.get('location');
    assert(qrRes.status === 302 && (location === '/menu' || location === '/menu/'), `7. QR /q/menu redirects (302 to "${location}")`);

    // 8. Admin login access
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    await page.fill('input[type="email"]', 'owner@amolvegresto.in');
    await page.fill('input[type="password"]', 'Admin@nirvanaa26');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(800);
    const adminTitle = await page.locator('.admin-header-title').textContent().catch(() => '');
    assert(adminTitle.includes('Amol'), '8. Owner login successfully grants access to Admin Dashboard');

    await page.close();
  } catch (err) {
    console.error('Smoke test exception:', err);
    failed++;
  } finally {
    await browser.close();
  }

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n--- SMOKE TESTS COMPLETED IN ${durationSec}s: ${passed} PASSED, ${failed} FAILED ---\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runSmokeTests();

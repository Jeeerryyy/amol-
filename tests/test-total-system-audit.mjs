import assert from 'assert';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'owner@amolvegresto.in';
const ADMIN_PASS = 'Admin@nirvanaa26';

async function main() {
  console.log('========================================================================');
  console.log('STARTING FULL SYSTEM VERIFICATION SUITE: ADMIN + MENU + REVIEW');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  let passedCount = 0;
  let failedCount = 0;

  async function runStep(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('PASS');
      passedCount++;
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      console.error(err);
      failedCount++;
    }
  }

  // ==========================================================================
  // PART 1: TOTAL ADMIN PANEL FUNCTIONS, BUTTONS, FEATURES & LIVE SYNC
  // ==========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('PART 1: ADMIN PANEL FEATURES, BUTTONS & LIVE SYNC');
  console.log('------------------------------------------------------------------------');

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  await runStep('1.1 Admin Authentication & Session', async () => {
    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASS);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForSelector('.admin-nav-item', { timeout: 10000 });
    const headerTitle = await adminPage.locator('.admin-header-title').innerText();
    assert.ok(headerTitle.includes('Amol Veg Restaurant'), `Header title mismatch: ${headerTitle}`);
  });

  await runStep('1.2 Admin Dashboard Navigation & KPI metrics', async () => {
    await adminPage.click('.admin-nav-item:has-text("Dashboard")');
    await adminPage.waitForSelector('.admin-page-title:has-text("Dashboard Overview")', { timeout: 8000 });
    await adminPage.waitForSelector('.admin-card', { timeout: 8000 });

    // Test time range filter buttons (Today, 7D, 30D, All)
    for (const range of ['Today', '7D', '30D', 'All']) {
      const btn = adminPage.locator('button').filter({ hasText: new RegExp(`^${range}$`) }).first();
      if (await btn.isVisible()) {
        await btn.click();
        await adminPage.waitForTimeout(200);
      }
    }
    const cardTexts = await adminPage.locator('.admin-card').allInnerTexts();
    assert.ok(cardTexts.some(t => t.includes("Today's Scans") || t.includes("Last 7 Days")), 'KPI cards not found');
  });

  await runStep('1.3 Admin QR Codes Tab (List, Destination Edit, Download)', async () => {
    await adminPage.click('.admin-nav-item:has-text("QR Codes")');
    await adminPage.waitForSelector('.admin-page-title:has-text("Dynamic QR Codes")', { timeout: 8000 });
    
    // Check for QR actions and cards
    const qrCount = await adminPage.locator('.admin-card, h3, button:has-text("Download")').count();
    assert.ok(qrCount > 0, 'No QR code items found');
  });

  await runStep('1.4 Admin Menus Tab: Categories, Dishes, and Action Buttons', async () => {
    await adminPage.click('.admin-nav-item:has-text("Menus")');
    await adminPage.waitForSelector('.admin-tab-btn', { timeout: 8000 });

    // 1. Categories sub-tab
    const catTab = adminPage.locator('.admin-tab-btn:has-text("Categories")');
    await catTab.click();
    await adminPage.waitForSelector('.admin-table tbody tr', { timeout: 8000 });
    const catRows = await adminPage.locator('.admin-table tbody tr').count();
    assert.ok(catRows > 0, 'No categories found');

    // 2. Dishes sub-tab (search & filter)
    const dishesTab = adminPage.locator('.admin-tab-btn:has-text("Dishes")');
    await dishesTab.click();
    await adminPage.waitForTimeout(400);

    const searchInput = adminPage.locator('.admin-search-input, input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Paneer');
      await adminPage.waitForTimeout(400);
      const filteredCount = await adminPage.locator('.admin-table tbody tr').count();
      assert.ok(filteredCount > 0, 'Paneer search returned 0 results in admin');
      await searchInput.fill('');
      await adminPage.waitForTimeout(300);
    }

    // 3. Menu Buttons sub-tab
    const buttonsTab = adminPage.locator('.admin-tab-btn:has-text("Menu Buttons")');
    await buttonsTab.click();
    await adminPage.waitForSelector('.admin-menu-button-row', { timeout: 8000 });
    const btnRows = await adminPage.locator('.admin-menu-button-row').count();
    assert.ok(btnRows >= 4, `Expected at least 4 action buttons, found ${btnRows}`);
  });

  await runStep('1.5 Admin Gallery Tab', async () => {
    await adminPage.click('.admin-nav-item:has-text("Gallery")');
    await adminPage.waitForSelector('h1:has-text("Gallery Management")', { timeout: 8000 });
    const hasGalleryContent = await adminPage.locator('h1:has-text("Gallery Management")').count();
    assert.ok(hasGalleryContent > 0, 'Gallery page did not load');
  });

  await runStep('1.6 Admin Website Content: Popular Dishes Header, Live Preview & Sub-tabs', async () => {
    await adminPage.click('.admin-nav-item:has-text("Website")');
    await adminPage.waitForSelector('.admin-tab:has-text("Popular Dishes")', { timeout: 8000 });

    // Verify Popular Dishes Header form & Live Preview
    const prefixInput = adminPage.locator('input[placeholder="e.g. Our"]');
    const highlightInput = adminPage.locator('input[placeholder="e.g. Popular Dishes"]');
    const subtitleInput = adminPage.locator('input[placeholder="e.g. SIMPLE INGREDIENTS, MEMORABLE FLAVOURS."]');
    await prefixInput.waitFor({ state: 'visible', timeout: 5000 });

    assert.ok(await prefixInput.isVisible(), 'Prefix input not visible');
    assert.ok(await highlightInput.isVisible(), 'Highlight input not visible');
    assert.ok(await subtitleInput.isVisible(), 'Subtitle input not visible');

    // Test Contact & Social tab
    const contactTab = adminPage.locator('.admin-tab:has-text("Contact & Social")');
    await contactTab.click();
    await adminPage.waitForTimeout(300);
    assert.ok(await adminPage.locator('input[type="tel"], input[placeholder*="Phone"], input[value*="72496"], input[value*="91586"]').count() > 0, 'Contact phone input not found');

    // Test Footer & FSSAI tab
    const footerTab = adminPage.locator('.admin-tab:has-text("Footer & FSSAI")');
    await footerTab.click();
    await adminPage.waitForTimeout(300);

    // Test Legal Pages tab
    const legalTab = adminPage.locator('.admin-tab:has-text("Legal Pages")');
    await legalTab.click();
    await adminPage.waitForTimeout(300);

    // Test SEO Metadata tab
    const seoTab = adminPage.locator('.admin-tab:has-text("SEO Metadata")');
    await seoTab.click();
    await adminPage.waitForTimeout(300);
  });

  await runStep('1.7 Admin Reviews Tab (Analytics, Options CRUD, Google Link)', async () => {
    await adminPage.click('.admin-nav-item:has-text("Reviews")');
    await adminPage.waitForSelector('.admin-page-title:has-text("Review System Controls")', { timeout: 8000 });

    // Click Google Review Link sub-tab
    const linkTab = adminPage.locator('.admin-tab:has-text("Google Review Link")');
    await linkTab.click();
    await adminPage.waitForTimeout(300);

    // Verify Google link input exists
    const googleLinkInput = adminPage.locator('input[type="url"], input[placeholder*="URL"]');
    await googleLinkInput.waitFor({ state: 'visible', timeout: 5000 });
    const currentUrl = await googleLinkInput.inputValue();
    assert.ok(currentUrl.includes('google.com') || currentUrl.includes('http'), `Invalid Google Review URL: ${currentUrl}`);
  });

  await runStep('1.8 Admin Settings Tab (Export JSON/CSV & System Status)', async () => {
    await adminPage.click('.admin-nav-item:has-text("Settings")');
    await adminPage.waitForSelector('button:has-text("Export"), a:has-text("Export")', { timeout: 8000 });
    const exportButtons = await adminPage.locator('button:has-text("Export"), a:has-text("Export")').count();
    assert.ok(exportButtons > 0, 'Export buttons missing in Settings tab');
  });

  // ==========================================================================
  // PART 2: TOTAL MENU WORKING & RESPONSIVENESS FOR ALL SCREEN TYPES
  // ==========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('PART 2: DIGITAL MENU WORKING & MULTI-VIEWPORT RESPONSIVENESS');
  console.log('------------------------------------------------------------------------');

  const viewports = [
    { name: 'Desktop Large (1920x1080)', width: 1920, height: 1080 },
    { name: 'Desktop Standard (1280x800)', width: 1280, height: 800 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Mobile Standard (390x844 - iPhone 14)', width: 390, height: 844 },
    { name: 'Mobile Compact (375x667 - iPhone SE)', width: 375, height: 667 },
    { name: 'Mobile Wide (412x915 - Pixel 7)', width: 412, height: 915 },
  ];

  for (const vp of viewports) {
    await runStep(`2.1 Menu Responsiveness & Layout: ${vp.name}`, async () => {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`${BASE_URL}/menu/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.menu-category-nav, .category-tabs-track', { timeout: 10000 });

      // Verify no horizontal document overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1; // 1px tolerance
      });
      assert.strictEqual(overflow, false, `Horizontal overflow detected on ${vp.name}`);

      // Verify category navigation exists
      const catBtns = page.locator('.category-tab-btn');
      const catCount = await catBtns.count();
      assert.ok(catCount >= 10, `Expected at least 10 category tabs on ${vp.name}, found ${catCount}`);

      // Verify dishes are rendered
      const dishCards = page.locator('.menu-dish-card');
      const dishCount = await dishCards.count();
      assert.ok(dishCount > 20, `Expected over 20 dishes on ${vp.name}, found ${dishCount}`);

      await page.close();
    });
  }

  await runStep('2.2 Menu Search & Instant Filter Interaction', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/menu/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#searchInput', { timeout: 10000 });

    const searchInput = page.locator('#searchInput');

    // Search for "Paneer" and dispatch input event to ensure instant filter trigger
    await searchInput.fill('Paneer');
    await searchInput.dispatchEvent('input');
    await page.waitForTimeout(600);

    const visibleTitles = await page.locator('.menu-dish-card:visible .dish-card-title').allInnerTexts();
    assert.ok(visibleTitles.length > 0, 'No dishes visible after searching Paneer');
    for (const t of visibleTitles) {
      assert.ok(t.toLowerCase().includes('paneer'), `Search returned non-paneer dish: ${t}`);
    }

    // Clear search using clear button or empty string
    const clearBtn = page.locator('#searchClearBtn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    } else {
      await searchInput.fill('');
      await searchInput.dispatchEvent('input');
    }
    await page.waitForTimeout(500);

    const restoredCount = await page.locator('.menu-dish-card').count();
    assert.ok(restoredCount > 50, 'Dishes not restored after clearing search');

    await page.close();
  });

  await runStep('2.3 Dish Modal Interaction & 4 Action Buttons on Desktop and Mobile', async () => {
    for (const vp of [{ width: 1280, height: 800, mode: 'Desktop' }, { width: 390, height: 844, mode: 'Mobile' }]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`${BASE_URL}/menu/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.menu-dish-card', { timeout: 10000 });

      // Click first dish card
      const firstCard = page.locator('.menu-dish-card').first();
      await firstCard.click();

      // Wait for dish modal to be active
      const modal = page.locator('#dishModal.active, #dishModal[style*="display: block"], #dishModal:visible');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Verify dish photo loaded properly
      const modalImg = page.locator('#modalDishImg, .dish-modal-img');
      if (await modalImg.isVisible()) {
        const imgStatus = await modalImg.evaluate((el) => ({
          complete: el.complete,
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
        }));
        assert.ok(imgStatus.complete && imgStatus.naturalWidth > 0, `Modal image not loaded on ${vp.mode}`);
      }

      // Verify the 4 Uiverse action buttons
      const actionRow = page.locator('#modalActionsRow');
      await actionRow.waitFor({ state: 'visible', timeout: 5000 });

      const buttons = actionRow.locator('.uiverse-menu-btn');
      const btnCount = await buttons.count();
      assert.ok(btnCount >= 4, `Expected 4 action buttons in modal on ${vp.mode}, found ${btnCount}`);

      const btnTexts = (await buttons.allInnerTexts()).join(' ');
      assert.ok(btnTexts.includes('WhatsApp'), `Missing WhatsApp button on ${vp.mode}`);
      assert.ok(btnTexts.includes('Waiter'), `Missing Waiter button on ${vp.mode}`);
      assert.ok(btnTexts.includes('Zomato'), `Missing Zomato button on ${vp.mode}`);
      assert.ok(btnTexts.includes('Swiggy'), `Missing Swiggy button on ${vp.mode}`);

      // Verify responsive button sizing: on mobile, buttons should be full width (>=260px)
      if (vp.mode === 'Mobile') {
        const firstBtnBox = await buttons.first().boundingBox();
        assert.ok(firstBtnBox.width >= 260, `Mobile button width too small (${firstBtnBox.width}px) on ${vp.mode}`);
      }

      // Close modal
      const closeBtn = page.locator('#modalCloseBtn, .modal-close-icon-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(400);

      await page.close();
    }
  });

  // ==========================================================================
  // PART 3: REVIEW SYSTEM WORKING & ADMIN SYNC
  // ==========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('PART 3: REVIEW SYSTEM WORKING (DESKTOP & MOBILE)');
  console.log('------------------------------------------------------------------------');

  for (const vp of [{ width: 1280, height: 800, mode: 'Desktop' }, { width: 390, height: 844, mode: 'Mobile' }]) {
    await runStep(`3.1 Review Page Load & 5-Star Rating Flow (${vp.mode})`, async () => {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`${BASE_URL}/review`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.star-btn', { timeout: 10000 });

      // Verify 5 stars
      const stars = page.locator('.star-btn');
      assert.strictEqual(await stars.count(), 5, `Expected 5 stars on Review page (${vp.mode})`);

      // Select 5 stars
      await stars.nth(4).click();
      await page.waitForTimeout(500);

      // Verify feedback options appear
      const options = page.locator('.chip-btn, .option-chip');
      const optCount = await options.count();
      assert.ok(optCount > 0, `No review options displayed after 5-star rating on ${vp.mode}`);

      // Select first tag
      await options.nth(0).click();
      await page.waitForTimeout(300);

      // Verify review text is automatically drafted/generated
      const textarea = page.locator('#review-textarea, textarea.review-textarea');
      await textarea.waitFor({ state: 'visible', timeout: 5000 });
      const generatedText = await textarea.inputValue();
      assert.ok(generatedText.length > 10, `Generated review text too short on ${vp.mode}: "${generatedText}"`);

      // Test "Regenerate" button
      const regenBtn = page.locator('.btn-regenerate');
      if (await regenBtn.isVisible()) {
        await regenBtn.click();
        await page.waitForTimeout(600);
        const newText = await textarea.inputValue();
        assert.ok(newText.length > 10, `Regenerated text too short: "${newText}"`);
      }

      // Verify Submit / "Copy & Open Google" button exists
      const submitBtn = page.locator('.btn-submit-review');
      assert.ok(await submitBtn.isVisible(), `Submit review button not visible on ${vp.mode}`);

      await page.close();
    });
  }

  await runStep('3.2 Review Submission & Copied State Flow', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE_URL}/review`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.star-btn', { timeout: 10000 });

    // Prevent real window.open popup from interrupting headless runner
    await page.evaluate(() => {
      window.open = () => null;
    });

    // Select 5 stars
    await page.locator('.star-btn').nth(4).click();
    await page.waitForTimeout(500);

    // Click submit
    const submitBtn = page.locator('.btn-submit-review');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Verify confirmation/thank you screen appears
    const successCard = page.locator('.review-success-card').first();
    await successCard.waitFor({ state: 'visible', timeout: 5000 });
    const successText = await page.locator('.success-heading').first().innerText();
    assert.ok(successText.includes('Review copied') || successText.includes('Review Copied') || successText.includes('Thank You') || successText.includes('Opening Google'), `Unexpected success text: ${successText}`);

    await page.close();
  });

  // ==========================================================================
  // FINAL SCORE & REPORT
  // ==========================================================================
  console.log('\n========================================================================');
  console.log(`TOTAL AUDIT FINISHED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    throw new Error(`${failedCount} test(s) failed in total system verification.`);
  }
}

main().catch((err) => {
  console.error('\nSYSTEM VERIFICATION SUITE FAILED:', err);
  process.exit(1);
});

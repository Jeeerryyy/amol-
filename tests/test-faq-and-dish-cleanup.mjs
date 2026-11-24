import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const BASE_URL = 'http://localhost:5173';
const MENU_URL = 'http://localhost:5173/menu/';

async function runVerification() {
  console.log('========================================================================');
  console.log('STARTING FAQ PAGE & DISH BOILERPLATE CLEANUP VERIFICATION');
  console.log('========================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify SQLite Database and JSON data
  console.log('\n--- 1. DATABASE & JSON DATA CHECK ---');
  const db = new DatabaseSync(path.resolve('data/restaurant.db'));
  const boilerplateMatches = db.prepare(
    "SELECT count(*) as count FROM dishes WHERE description LIKE 'Authentic pure vegetarian % prepared fresh with traditional spices%'"
  ).get();
  assert(boilerplateMatches.count === 0, `Database has 0 boilerplate dish descriptions (found: ${boilerplateMatches.count})`);

  const menuJson = JSON.parse(fs.readFileSync('public/menu/restaurant_menu_data.json', 'utf8'));
  const jsonMatches = menuJson.dishes.filter(d =>
    d.description && d.description.includes('Authentic pure vegetarian')
  );
  assert(jsonMatches.length === 0, `restaurant_menu_data.json has 0 boilerplate descriptions (found: ${jsonMatches.length})`);

  // 2. Launch Browser for UI Tests
  console.log('\n--- 2. UI NAVIGATION & PAGE CHECKS ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 2.1 Check Landing Page (Homepage)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homepageFaq = await page.$('.faq-section');
    assert(homepageFaq === null, 'Homepage does NOT render the FAQ section');

    // 2.2 Check Desktop Navbar for FAQ link
    const faqNavLink = await page.$('nav.navbar-nav a[href="#/faq"]');
    assert(faqNavLink !== null, 'Desktop navbar contains FAQ link pointing to "#/faq"');
    const faqNavText = await faqNavLink.innerText();
    assert(faqNavText.includes('FAQ'), `Desktop navbar link text is "${faqNavText.trim()}"`);

    // 2.3 Check Mobile Drawer for FAQ link
    await page.setViewportSize({ width: 390, height: 844 });
    const hamburgerBtn = await page.$('.navbar-hamburger-btn');
    assert(hamburgerBtn !== null, 'Mobile hamburger button is present');
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    const mobileFaqLink = await page.$('.mobile-drawer-nav a[href="#/faq"]');
    assert(mobileFaqLink !== null, 'Mobile drawer contains FAQ link pointing to "#/faq"');

    // Click FAQ link in mobile drawer
    await mobileFaqLink.click();
    await page.waitForTimeout(600);

    // 2.4 Verify FAQ Page Rendering
    const currentUrl = page.url();
    assert(currentUrl.includes('#/faq'), `Navigated to FAQ page URL: ${currentUrl}`);

    await page.waitForSelector('.faq-heading', { timeout: 5000 });
    const faqHeading = await page.$eval('.faq-heading', el => el.textContent).catch(() => '');
    assert(faqHeading.toLowerCase().includes('frequently asked questions'), `FAQ page title contains "Frequently Asked Questions" (actual: "${faqHeading.trim()}")`);

    const faqSubtitle = await page.$eval('.faq-subtitle', el => el.textContent).catch(() => '');
    assert(faqSubtitle.includes('Quick answers to common questions about Amol Veg Resto.'), `FAQ page subtitle is correct (actual: "${faqSubtitle.trim()}")`);

    // Check Breadcrumb
    const breadcrumb = await page.$('.faq-breadcrumb-nav');
    assert(breadcrumb !== null, 'FAQ page has breadcrumb navigation');

    // Check Accordion Functionality
    const firstQuestion = await page.$('.faq-item-trigger');
    assert(firstQuestion !== null, 'FAQ question accordion button exists');
    await firstQuestion.click();
    await page.waitForTimeout(300);
    const firstAnswer = await page.$('.faq-item-body');
    assert(firstAnswer !== null, 'FAQ answer expanded on click');

    // 2.5 Check Footer FAQ Link
    const footerFaqLink = await page.$('footer a[href="#/faq"]');
    assert(footerFaqLink !== null, 'Footer Quick Links contains FAQ link');

    // 3. Check Digital Menu Modal
    console.log('\n--- 3. DIGITAL MENU MODAL DISH CLEANUP CHECK ---');
    await page.goto(MENU_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.menu-dish-card', { timeout: 10000 });

    // Open first dish
    const firstDishCard = await page.$('.menu-dish-card');
    assert(firstDishCard !== null, 'Menu dish card found');
    await firstDishCard.click();
    await page.waitForTimeout(400);

    const modalTitle = await page.$eval('#modalDishTitle', el => el.innerText);
    const modalDescText = await page.$eval('#modalDishDesc', el => el.innerText);
    const modalDescDisplay = await page.$eval('#modalDishDesc', el => window.getComputedStyle(el).display);

    console.log(`Inspected dish: "${modalTitle}"`);
    console.log(`Description text: "${modalDescText}"`);
    console.log(`Description display style: "${modalDescDisplay}"`);

    assert(
      !modalDescText.includes('Authentic pure vegetarian') &&
      !modalDescText.includes('prepared fresh with traditional spices'),
      'Dish modal does NOT contain boilerplate description'
    );
    assert(modalDescDisplay === 'none', 'Empty description element is cleanly hidden (display: none)');

    // Search for Sweetcorn Pizza specifically (which user mentioned)
    const searchInput = await page.$('#menuSearchInput');
    if (searchInput) {
      await searchInput.fill('Sweetcorn Pizza');
      await page.waitForTimeout(400);
      const pizzaCard = await page.$('.menu-dish-card');
      if (pizzaCard) {
        await pizzaCard.click();
        await page.waitForTimeout(400);
        const pizzaTitle = await page.$eval('#modalDishTitle', el => el.innerText);
        const pizzaDesc = await page.$eval('#modalDishDesc', el => el.innerText);
        const pizzaDescDisplay = await page.$eval('#modalDishDesc', el => window.getComputedStyle(el).display);

        console.log(`Inspected Sweetcorn Pizza modal: title="${pizzaTitle}", desc="${pizzaDesc}", display="${pizzaDescDisplay}"`);
        assert(pizzaTitle.includes('Sweetcorn Pizza'), 'Found Sweetcorn Pizza modal');
        assert(pizzaDesc !== 'Authentic pure vegetarian Sweetcorn Pizza prepared fresh with traditional spices.', 'Sweetcorn Pizza boilerplate text removed');
        assert(pizzaDescDisplay === 'none', 'Sweetcorn Pizza description element is cleanly hidden');
      }
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

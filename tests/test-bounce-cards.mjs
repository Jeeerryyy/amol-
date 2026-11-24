import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Testing BounceCards on Home Page Gallery Section...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Desktop Test
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('#gallery');
    console.log('   Navigated to Home page, found #gallery section.');

    // Scroll gallery into view
    const gallerySection = page.locator('#gallery');
    await gallerySection.scrollIntoViewIfNeeded();

    // Verify BounceCards rendered
    await page.waitForSelector('.bounce-cards');
    const cards = page.locator('.bounce-cards__card');
    const count = await cards.count();
    console.log(`   Found ${count} bounce cards in Gallery section.`);
    if (count < 3) {
      throw new Error(`Expected at least 3 cards, found ${count}`);
    }

    // Wait for physics spring animation to run
    await page.waitForTimeout(1000);

    // Verify card has transformed scale and is visible
    const firstCard = cards.first();
    const styleAttr = await firstCard.getAttribute('style');
    console.log(`   Card transform style: ${styleAttr}`);
    if (!styleAttr || !styleAttr.includes('matrix') && !styleAttr.includes('translate3d') && !styleAttr.includes('scale')) {
      throw new Error('Card did not get physics transform styles');
    }

    // Hover over middle card to trigger physics interaction
    const middleCard = cards.nth(Math.floor(count / 2));
    const box = await middleCard.boundingBox();
    if (box) {
      console.log(`   Hovering over middle card at (${box.x + box.width / 2}, ${box.y + box.height / 2})...`);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(600);
      const activeCard = page.locator('.bounce-cards__card[data-active]');
      const hasActive = await activeCard.count();
      console.log(`   Active hovered card count: ${hasActive}`);
    }

    // 2. Mobile Test
    console.log('📱 Testing Mobile Viewport (375x667)...');
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 667 });
    await mobilePage.goto('http://localhost:5173/');
    await mobilePage.waitForSelector('#gallery');
    const mobileGallery = mobilePage.locator('#gallery');
    await mobileGallery.scrollIntoViewIfNeeded();
    await mobilePage.waitForSelector('.bounce-cards');
    await mobilePage.waitForTimeout(1000);

    // Check no horizontal document overflow
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`   Mobile document scrollWidth: ${scrollWidth}px, clientWidth: ${clientWidth}px`);
    if (scrollWidth > clientWidth + 2) {
      throw new Error(`Horizontal overflow detected! scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`);
    }

    console.log('🎉 BounceCards E2E Test PASSED flawlessly on desktop and mobile!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://localhost:5173/menu/');
  await desktopPage.waitForSelector('.menu-dish-card');
  await desktopPage.locator('.menu-dish-card').first().click();
  await desktopPage.waitForSelector('#dishModal.open');
  await desktopPage.waitForSelector('#modalActionsRow .uiverse-menu-btn');
  await desktopPage.screenshot({ path: 'modal-desktop-preview.png' });
  console.log('✅ Captured modal-desktop-preview.png');

  // 2. Mobile
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5173/menu/');
  await mobilePage.waitForSelector('.menu-dish-card');
  await mobilePage.locator('.menu-dish-card').first().click();
  await mobilePage.waitForSelector('#dishModal.open');
  await mobilePage.waitForSelector('#modalActionsRow .uiverse-menu-btn');
  await mobilePage.screenshot({ path: 'modal-mobile-preview.png' });
  console.log('✅ Captured modal-mobile-preview.png');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

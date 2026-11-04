import { chromium } from 'playwright';

async function testAdmin() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/admin');
  await page.waitForTimeout(400);
  await page.fill('input[type="email"]', 'owner@amolvegresto.in');
  await page.fill('input[type="password"]', 'Admin@nirvanaa26');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);

  // Navigate to Menus
  await page.click('a:has-text("Menus")');
  await page.waitForTimeout(800);

  const dishRows = await page.locator('.admin-table tbody tr').count();
  console.log(`Admin Menus Table Loaded: ${dishRows} dish rows displayed.`);

  // Check category tabs in Admin
  await page.click('button:has-text("Categories")');
  await page.waitForTimeout(600);
  const catRows = await page.locator('.admin-table tbody tr').count();
  console.log(`Admin Categories Table Loaded: ${catRows} category rows displayed.`);

  await browser.close();
}

testAdmin().catch(console.error);


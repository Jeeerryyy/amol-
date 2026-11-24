import { chromium } from 'playwright';

async function main() {
  console.log('Starting E2E Verification of Popular Dishes Section Header Sync...');

  const browser = await chromium.launch({ headless: true });
  const adminContext = await browser.newContext();
  const publicContext = await browser.newContext();

  const adminPage = await adminContext.newPage();
  const publicPage = await publicContext.newPage();

  try {
    // 1. Log into Admin Panel
    console.log('1. Logging into Admin Panel at http://localhost:5173/admin/login...');
    await adminPage.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    await adminPage.fill('input[type="email"]', 'owner@amolvegresto.in');
    await adminPage.fill('input[type="password"]', 'Admin@nirvanaa26');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForSelector('.admin-nav-item', { timeout: 10000 });
    console.log('   Logged in successfully.');

    // 2. Navigate to Website tab
    console.log('2. Navigating to Website Content section in Admin...');
    const websiteNav = adminPage.locator('.admin-nav-item:has-text("Website")');
    await websiteNav.click();
    await adminPage.waitForSelector('.admin-tab:has-text("Popular Dishes")', { timeout: 10000 });
    console.log('   Website management page loaded.');

    // 3. Ensure Popular Dishes tab is selected
    console.log('3. Checking Section Heading & Subtitle form in Admin...');
    const popularTab = adminPage.locator('.admin-tab:has-text("Popular Dishes")');
    await popularTab.click();
    await adminPage.waitForTimeout(600);

    const prefixInput = adminPage.locator('input[placeholder="e.g. Our"]');
    const highlightInput = adminPage.locator('input[placeholder="e.g. Popular Dishes"]');
    const subtitleInput = adminPage.locator('input[placeholder="e.g. SIMPLE INGREDIENTS, MEMORABLE FLAVOURS."]');

    await prefixInput.waitFor({ state: 'visible', timeout: 5000 });
    const currentPrefix = await prefixInput.inputValue();
    const currentHighlight = await highlightInput.inputValue();
    const currentSubtitle = await subtitleInput.inputValue();
    console.log(`   Admin Form values: Prefix="${currentPrefix}", Highlight="${currentHighlight}", Subtitle="${currentSubtitle}"`);

    // 4. Open Homepage
    console.log('4. Opening Homepage at http://localhost:5173/...');
    await publicPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const section = publicPage.locator('#popular-dishes');
    await section.scrollIntoViewIfNeeded();

    const initialHeading = await section.locator('.section-main-heading').innerText();
    const initialSubtitle = await section.locator('.section-subtitle').innerText();
    console.log(`   Homepage initial rendered: Heading="${initialHeading}", Subtitle="${initialSubtitle}"`);

    if (!initialHeading.includes('Popular Dishes') || !initialSubtitle.includes('SIMPLE INGREDIENTS')) {
      throw new Error(`Unexpected initial homepage text: Heading="${initialHeading}", Subtitle="${initialSubtitle}"`);
    }

    // 5. Update header in Admin to test real-time update
    console.log('5. Updating Section Header in Admin to "Chef\'s Signature Specials"...');
    await prefixInput.fill("Chef's");
    await highlightInput.fill('Signature Specials');
    await subtitleInput.fill('HAND-CRAFTED VEGETARIAN DELIGHTS.');

    const saveBtn = adminPage.locator('button:has-text("Save Section Header")');
    await saveBtn.click();

    // Check for success toast
    const toast = adminPage.locator('.admin-toast-success');
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   Success toast confirmed in Admin.');

    // 6. Verify real-time update on Homepage without reloading
    console.log('6. Watching Homepage for real-time synchronization...');
    await publicPage.waitForFunction(() => {
      const heading = document.querySelector('#popular-dishes .section-main-heading')?.textContent || '';
      const subtitle = document.querySelector('#popular-dishes .section-subtitle')?.textContent || '';
      return heading.includes('Signature Specials') && subtitle.includes('HAND-CRAFTED');
    }, { timeout: 8000 });

    const updatedHeading = await section.locator('.section-main-heading').innerText();
    const updatedSubtitle = await section.locator('.section-subtitle').innerText();
    console.log(`   REAL-TIME UPDATE CONFIRMED on Homepage: Heading="${updatedHeading}", Subtitle="${updatedSubtitle}"`);

    // 7. Revert back to original target: "Our Popular Dishes" / "SIMPLE INGREDIENTS, MEMORABLE FLAVOURS."
    console.log('7. Restoring user requested title: "Our Popular Dishes" / "SIMPLE INGREDIENTS, MEMORABLE FLAVOURS."...');
    await prefixInput.fill('Our');
    await highlightInput.fill('Popular Dishes');
    await subtitleInput.fill('SIMPLE INGREDIENTS, MEMORABLE FLAVOURS.');
    await saveBtn.click();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   Restored successfully in Admin.');

    // 8. Verify Homepage reflects restored values
    console.log('8. Verifying final restored state on Homepage...');
    await publicPage.waitForFunction(() => {
      const heading = document.querySelector('#popular-dishes .section-main-heading')?.textContent || '';
      const subtitle = document.querySelector('#popular-dishes .section-subtitle')?.textContent || '';
      return heading.includes('Popular Dishes') && subtitle.includes('SIMPLE INGREDIENTS, MEMORABLE FLAVOURS.');
    }, { timeout: 8000 });

    const finalHeading = await section.locator('.section-main-heading').innerText();
    const finalSubtitle = await section.locator('.section-subtitle').innerText();
    console.log(`   FINAL VERIFIED HOMEPAGE: Heading="${finalHeading}", Subtitle="${finalSubtitle}"`);

    // Take screenshot of updated section
    await section.screenshot({ path: 'public/popular-dishes-header-verified.png' });
    console.log('   Saved screenshot to public/popular-dishes-header-verified.png');

    console.log('\nALL POPULAR DISHES HEADER ADMIN & REAL-TIME SYNC CHECKS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});

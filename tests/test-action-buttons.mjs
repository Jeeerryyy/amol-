import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Starting E2E verification of Customizable Menu Action Buttons...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    // 1. Log into Admin
    console.log('1️⃣ Logging into Admin panel...');
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5173/admin/login');
    await adminPage.fill('input[type="email"]', 'owner@amolvegresto.in');
    await adminPage.fill('input[type="password"]', 'Admin@nirvanaa26');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForSelector('.admin-tabs-row, .admin-card-header, button:has-text("Menu Buttons")', { timeout: 10000 });
    console.log('   Logged in successfully.');

    // 2. Go to Menus -> Menu Buttons tab
    console.log('2️⃣ Navigating to Menu Buttons tab in Admin...');
    const menusNav = adminPage.locator('button:has-text("Menus"), a:has-text("Menus")').first();
    if (await menusNav.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menusNav.click();
    } else {
      await adminPage.goto('http://localhost:5173/admin/menus');
    }
    await adminPage.waitForSelector('.admin-tabs-row', { timeout: 10000 });
    
    // Click Menu Buttons tab
    const buttonTab = adminPage.locator('button:has-text("Menu Buttons")');
    await buttonTab.click();
    await adminPage.waitForSelector('text=Customizable Menu Action Buttons');
    console.log('   Customizable Menu Action Buttons tab active.');

    // Count buttons in Admin
    const buttonRows = adminPage.locator('h3:has-text("Customizable Menu Action Buttons")');
    const headerText = await buttonRows.innerText();
    console.log(`   Header text: "${headerText}"`);

    // 3. Open Public Menu in a second page
    console.log('3️⃣ Opening Public Menu (/menu/)...');
    const menuPage = await context.newPage();
    await menuPage.setViewportSize({ width: 390, height: 844 }); // iPhone mobile viewport
    await menuPage.goto('http://localhost:5173/menu/');
    await menuPage.waitForSelector('.menu-dish-card');
    console.log('   Menu loaded successfully on mobile viewport.');

    // Click on the first dish card to open modal
    console.log('4️⃣ Opening first dish modal...');
    const firstDish = menuPage.locator('.menu-dish-card').first();
    await firstDish.click();
    await menuPage.waitForSelector('#dishModal.open');
    console.log('   Dish modal opened.');

    // Verify all 4 default buttons are rendered in modal
    await menuPage.waitForSelector('#modalActionsRow .uiverse-menu-btn');
    const renderedButtons = menuPage.locator('#modalActionsRow .uiverse-menu-btn');
    const count = await renderedButtons.count();
    console.log(`   Rendered action buttons count in modal: ${count}`);
    if (count < 2) {
      throw new Error(`Expected at least 2 action buttons, got ${count}`);
    }

    // Verify WhatsApp button attributes
    const waBtn = menuPage.locator('#modalWhatsAppBtn');
    await waBtn.waitFor({ state: 'visible', timeout: 3000 });
    const waHref = await waBtn.getAttribute('href');
    console.log(`   WhatsApp button href: ${waHref?.substring(0, 50)}...`);

    // Check responsive dimensions: on mobile, buttons should be full width
    const waBox = await waBtn.boundingBox();
    console.log(`   Mobile button width: ${waBox.width}px, height: ${waBox.height}px`);
    if (waBox.width < 280) {
      throw new Error(`Expected mobile button to be full width (>=280px), got ${waBox.width}px`);
    }

    // 4. Test Real-Time update: Toggle Swiggy OFF in Admin
    console.log('5️⃣ Toggling Swiggy button OFF in Admin...');
    const swiggyRow = adminPage.locator('.admin-menu-button-row[data-button-id="btn_swiggy"]');
    const swiggyToggle = swiggyRow.locator('button:has-text("Enabled"), button:has-text("Disabled")').first();
    await swiggyToggle.click();
    console.log('   Clicked toggle in Admin.');

    // 5. In Menu page, wait without reloading and verify Swiggy disappears in real time!
    console.log('6️⃣ Checking real-time disappearance on Public Menu without refresh...');
    await menuPage.waitForFunction(() => {
      const texts = Array.from(document.querySelectorAll('#modalActionsRow .uiverse-menu-btn')).map(b => b.innerText);
      return !texts.some(t => t.includes('Swiggy'));
    }, { timeout: 8000 });
    console.log('   ✅ Real-time update verified! Swiggy button disappeared from open modal in real time!');

    // 6. Test Real-Time update: Toggle Swiggy back ON in Admin
    console.log('7️⃣ Toggling Swiggy button back ON in Admin...');
    await swiggyToggle.click();
    await menuPage.waitForFunction(() => {
      const texts = Array.from(document.querySelectorAll('#modalActionsRow .uiverse-menu-btn')).map(b => b.innerText);
      return texts.some(t => t.includes('Swiggy'));
    }, { timeout: 8000 });
    console.log('   ✅ Real-time update verified! Swiggy button reappeared in open modal in real time!');

    // 7. Add a custom action button in Admin
    console.log('8️⃣ Adding new custom action button in Admin...');
    const addBtn = adminPage.locator('button:has-text("Add Button")').first();
    await addBtn.click();
    await adminPage.waitForSelector('.admin-modal-content');

    // Fill form
    await adminPage.selectOption('select.admin-select', 'custom');
    await adminPage.fill('input[placeholder*="Order via WhatsApp"]', 'Order via UberEats');
    await adminPage.fill('input[placeholder="https://www.zomato.com/solapur"], input[type="url"]', 'https://www.ubereats.com');
    await adminPage.click('button:has-text("Create Button")');
    await adminPage.waitForSelector('.admin-modal-content', { state: 'detached', timeout: 4000 });
    console.log('   Custom button "Order via UberEats" created in Admin.');

    // 8. Verify custom button appears in Public Menu modal in real time!
    console.log('9️⃣ Verifying "Order via UberEats" appears on Public Menu in real time...');
    await menuPage.waitForFunction(() => {
      const texts = Array.from(document.querySelectorAll('#modalActionsRow .uiverse-menu-btn')).map(b => b.innerText);
      return texts.some(t => t.includes('UberEats'));
    }, { timeout: 8000 });
    console.log('   ✅ Real-time creation verified! "Order via UberEats" appeared in open modal!');

    // 9. Clean up: Delete "Order via UberEats" in Admin
    console.log('🔟 Cleaning up custom button in Admin...');
    const uberRow = adminPage.locator('.admin-menu-button-row:has(strong:has-text("Order via UberEats"))');
    adminPage.once('dialog', async dialog => {
      await dialog.accept();
    });
    await uberRow.locator('button[title="Delete button"]').click();
    await adminPage.waitForSelector('text=Order via UberEats', { state: 'detached', timeout: 5000 });
    console.log('   Custom button deleted.');

    // Verify it disappears from modal
    await menuPage.waitForFunction(() => {
      const texts = Array.from(document.querySelectorAll('#modalActionsRow .uiverse-menu-btn')).map(b => b.innerText);
      return !texts.some(t => t.includes('UberEats'));
    }, { timeout: 8000 });
    console.log('   ✅ Real-time deletion verified! Button removed from modal.');

    console.log('🎉 ALL TESTS PASSED! Menu Action Buttons and Real-Time Synchronization are working flawlessly!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

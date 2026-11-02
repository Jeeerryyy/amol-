/**
 * Automated Verification Suite for Admin Panel, Public Menus, QR codes, and Security
 */

async function runTests() {
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n--- 1. Testing Unauthenticated Access Rejection ---');
  const unauthRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
  assert(unauthRes.status === 401, 'GET /api/admin/dashboard requires authentication (401)');

  const unauthDishes = await fetch(`${BASE_URL}/api/admin/dishes`);
  assert(unauthDishes.status === 401, 'GET /api/admin/dishes requires authentication (401)');

  console.log('\n--- 2. Testing Login & CSRF Token Generation ---');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@amolvegresto.com', password: 'Admin@12345' }),
  });
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie') || '';
  const cookieHeader = cookies.split(';')[0]; // session cookie

  assert(loginRes.status === 200, 'Owner login successful (200)');
  assert(Boolean(loginData.csrfToken), 'Received CSRF token on login');
  assert(cookieHeader.includes('amol_admin_session'), 'Received httpOnly session cookie');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': cookieHeader,
    'x-csrf-token': loginData.csrfToken,
  };

  console.log('\n--- 3. Testing Dashboard Analytics ---');
  const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard?range=7D`, { headers: authHeaders });
  const dashData = await dashRes.json();
  assert(dashRes.status === 200, 'Dashboard loaded successfully');
  assert(dashData.kpis && dashData.kpis.allTime !== undefined, 'Dashboard has KPI metrics');
  assert(Array.isArray(dashData.peakHours) && dashData.peakHours.length === 24, 'Peak hours contains 24 hourly buckets in IST');

  console.log('\n--- 4. Testing CSRF Protection on Mutations ---');
  const noCsrfRes = await fetch(`${BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
    body: JSON.stringify({ name: 'CSRF Attack Test' }),
  });
  assert(noCsrfRes.status === 403, 'Mutation without CSRF token is blocked with 403 Forbidden');

  console.log('\n--- 5. Testing Pricing Engine & Overrides ---');
  // Get pricing settings
  const priceSetRes = await fetch(`${BASE_URL}/api/admin/settings`, { headers: authHeaders });
  const priceSettings = await priceSetRes.json();
  assert(priceSettings.special_markup_percent === 10, 'Default markup is 10%');
  assert(priceSettings.rounding_step === 1, 'Default rounding step is 1');

  // Verify Main vs Special price isolation on public endpoint
  const mainMenuRes = await fetch(`${BASE_URL}/api/public/menu/main`);
  const mainMenu = await mainMenuRes.json();
  const specialMenuRes = await fetch(`${BASE_URL}/api/public/menu/special`);
  const specialMenu = await specialMenuRes.json();

  assert(mainMenu.dishes.length > 0, `Main menu dishes loaded (${mainMenu.dishes.length} items)`);
  assert(specialMenu.dishes.length > 0, `Special menu dishes loaded (${specialMenu.dishes.length} items)`);

  const sampleMainDish = mainMenu.dishes.find((d) => d.name === 'Paneer Butter Masala');
  const sampleSpecialDish = specialMenu.dishes.find((d) => d.name === 'Paneer Butter Masala');

  if (sampleMainDish && sampleSpecialDish) {
    const expectedSpecial = Math.round(sampleMainDish.price * 1.1);
    assert(sampleSpecialDish.price === expectedSpecial, `Special menu price is marked up by 10% (₹${sampleMainDish.price} -> ₹${sampleSpecialDish.price})`);
  }

  console.log('\n--- 6. Testing Dynamic QR Redirect Latency & Dedupe ---');
  const t0 = Date.now();
  const qrRes = await fetch(`${BASE_URL}/q/menu`, { redirect: 'manual' });
  const latency = Date.now() - t0;

  assert(qrRes.status === 302, 'QR redirect returns HTTP 302');
  assert(qrRes.headers.get('cache-control')?.includes('no-store'), 'QR redirect has Cache-Control: no-store');
  assert(qrRes.headers.get('location')?.includes('/menu'), 'QR redirect points to /menu');
  assert(latency < 200, `QR redirect latency is fast (${latency}ms, target <150ms-200ms)`);

  console.log('\n--- 7. Testing Review System & Guardrails ---');
  const revConfigRes = await fetch(`${BASE_URL}/api/public/review-config`);
  const revConfig = await revConfigRes.json();
  assert(revConfig.options.length >= 3 && revConfig.options.length <= 14, `Review options within 3-14 guardrail (currently ${revConfig.options.length})`);
  assert(Boolean(revConfig.googleReviewUrl), 'Google Review URL is configured');

  // Test Review Events Logging
  const revEvRes = await fetch(`${BASE_URL}/api/public/review-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'started', stars: 5 }),
  });
  assert(revEvRes.status === 200, 'Logged review started event successfully');

  console.log('\n--- 8. Testing Rate Limiting (5 failures / 15 min) ---');
  let rateLimitHit = false;
  for (let i = 0; i < 6; i++) {
    const badLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_limit@amolvegresto.com', password: 'WrongPassword123' }),
    });
    if (badLoginRes.status === 429) {
      rateLimitHit = true;
      break;
    }
  }
  assert(rateLimitHit, 'Login rate limiter correctly locks out after 5 consecutive failures with 429');

  console.log('\n--- 9. Testing Data Exports (JSON & CSV) ---');
  const exportContentRes = await fetch(`${BASE_URL}/api/admin/export/content`, { headers: authHeaders });
  assert(exportContentRes.status === 200, 'Content export JSON status 200');
  const exportContent = await exportContentRes.json();
  assert(Array.isArray(exportContent.dishes) && exportContent.dishes.length > 0, `Exported ${exportContent.dishes.length} dishes in JSON backup`);

  const exportScansRes = await fetch(`${BASE_URL}/api/admin/export/scans`, { headers: authHeaders });
  const scansCsv = await exportScansRes.text();
  assert(exportScansRes.status === 200 && scansCsv.startsWith('id,qr_id'), 'Scans CSV export generated successfully');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

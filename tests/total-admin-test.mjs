/**
 * Total Admin Panel & Live Sync Automated Verification Suite
 * Tests every endpoint, button capability, and public consumer sync
 */
import assert from 'assert';

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'owner@amolvegresto.in';
const ADMIN_PASS = 'Admin@nirvanaa26';

let sessionCookie = '';
let csrfToken = '';

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    headers['x-csrf-token'] = csrfToken;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const cookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
  for (const c of cookieHeaders) {
    const match = c.match(/(amol_[a-z_]+_session)=([^;]+)/);
    if (match) {
      sessionCookie = `${match[1]}=${match[2]}`;
    }
  }

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType.includes('text/')) {
    data = await res.text();
  } else {
    data = await res.arrayBuffer();
  }

  return { status: res.status, headers: res.headers, data };
}

async function runTests() {
  console.log('=================================================================');
  console.log('🚀 STARTING TOTAL ADMIN PANEL & PUBLIC SYNC TEST SUITE');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      console.error(err);
      failed++;
    }
  }

  // 1. AUTHENTICATION
  await test('1.1 Login with invalid password fails with 401', async () => {
    const res = await request('/api/admin/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: 'WrongPassword123!' },
    });
    assert.strictEqual(res.status, 401);
  });

  await test('1.2 Login with valid credentials succeeds and issues cookie + CSRF', async () => {
    const res = await request('/api/admin/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASS },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.csrfToken, 'Missing csrfToken in response');
    csrfToken = res.data.csrfToken;
    assert.ok(sessionCookie.includes('session'), 'Missing session cookie');
  });

  await test('1.3 GET /api/admin/auth/me verifies session and returns csrfToken', async () => {
    const res = await request('/api/admin/auth/me');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.authenticated, true);
    assert.strictEqual(res.data.email.toLowerCase(), ADMIN_EMAIL.toLowerCase());
    assert.strictEqual(res.data.csrfToken, csrfToken);
  });

  // 2. DASHBOARD
  await test('2.1 GET /api/admin/dashboard (7D, Today, 30D, All) returns analytics metrics & menu health', async () => {
    for (const range of ['Today', '7D', '30D', 'All']) {
      const res = await request(`/api/admin/dashboard?range=${range}`);
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.kpis, `Missing kpis for range ${range}`);
      assert.ok(res.data.menuHealth, `Missing menuHealth for range ${range}`);
      assert.ok(res.data.reviews, `Missing reviews for range ${range}`);
      assert.ok(Array.isArray(res.data.peakHours));
      assert.ok(Array.isArray(res.data.scansList));
    }
  });

  // 3. MENUS & LIVE PUBLIC SYNC
  let testDishId = null;
  let originalBasePrice = null;
  let originalAvailability = null;

  await test('3.1 GET /api/admin/categories and GET /api/admin/dishes return menu items', async () => {
    const catRes = await request('/api/admin/categories');
    assert.strictEqual(catRes.status, 200);
    assert.ok(Array.isArray(catRes.data) && catRes.data.length > 0);

    const dishRes = await request('/api/admin/dishes');
    assert.strictEqual(dishRes.status, 200);
    assert.ok(Array.isArray(dishRes.data) && dishRes.data.length >= 250);

    const firstDish = dishRes.data[0];
    testDishId = firstDish.id;
    originalBasePrice = Number(firstDish.base_price);
    originalAvailability = Number(firstDish.is_available);
    assert.ok(testDishId, 'No dish found for testing');
  });

  await test('3.2 LIVE SYNC: Toggle Dish Availability and verify instantaneous update on public menu API', async () => {
    // Check initial public menu
    const pubRes1 = await request('/api/public/menu/main');
    assert.strictEqual(pubRes1.status, 200);
    const pubDish1 = pubRes1.data.dishes.find(d => d.id === testDishId);
    assert.ok(pubDish1, 'Dish not found in public menu');

    const toggledAvail = originalAvailability === 1 ? 0 : 1;

    // Mutate via admin API
    const updateRes = await request(`/api/admin/dishes/${testDishId}`, {
      method: 'PUT',
      body: {
        is_available: toggledAvail,
      },
    });
    assert.strictEqual(updateRes.status, 200);

    // Immediately inspect public menu (should reflect toggled status without delay)
    const pubRes2 = await request('/api/public/menu/main');
    assert.strictEqual(pubRes2.status, 200);
    const pubDish2 = pubRes2.data.dishes.find(d => d.id === testDishId);
    assert.strictEqual(pubDish2.is_available, toggledAvail, 'Public menu did not immediately sync dish availability');

    // Revert back
    await request(`/api/admin/dishes/${testDishId}`, {
      method: 'PUT',
      body: {
        is_available: originalAvailability,
      },
    });

    const pubRes3 = await request('/api/public/menu/main');
    const pubDish3 = pubRes3.data.dishes.find(d => d.id === testDishId);
    assert.strictEqual(pubDish3.is_available, originalAvailability);
  });

  await test('3.3 LIVE SYNC: Update Dish Price and verify instantaneous update on public menu API', async () => {
    const tempPrice = originalBasePrice + 25;

    // Update price
    const updateRes = await request(`/api/admin/dishes/${testDishId}`, {
      method: 'PUT',
      body: {
        base_price: tempPrice,
      },
    });
    assert.strictEqual(updateRes.status, 200);

    // Verify public main menu
    const pubRes = await request('/api/public/menu/main');
    const pubDish = pubRes.data.dishes.find(d => d.id === testDishId);
    assert.strictEqual(Number(pubDish.price), tempPrice, 'Public menu did not immediately sync price change');

    // Revert price
    await request(`/api/admin/dishes/${testDishId}`, {
      method: 'PUT',
      body: {
        base_price: originalBasePrice,
      },
    });

    const revertedPubRes = await request('/api/public/menu/main');
    const revertedDish = revertedPubRes.data.dishes.find(d => d.id === testDishId);
    assert.strictEqual(Number(revertedDish.price), originalBasePrice);
  });

  let createdCatId = null;
  let tempDishId = null;
  await test('3.4 LIVE SYNC: Add category + dish, verify in public menu, delete and verify removal', async () => {
    const testCatName = `TestCat_${Date.now()}`;
    const createCatRes = await request('/api/admin/categories', {
      method: 'POST',
      body: {
        name: testCatName,
        icon: 'utensils',
        scope: 'both',
        is_visible: 1,
      },
    });
    assert.strictEqual(createCatRes.status, 200);
    createdCatId = createCatRes.data.id;
    assert.ok(createdCatId, 'Missing created category id');

    // Add a test dish in this category so public menu displays it
    const createDishRes = await request('/api/admin/dishes', {
      method: 'POST',
      body: {
        name: `Test Dish ${Date.now()}`,
        category_id: createdCatId,
        base_price: 199,
        is_available: 1,
        is_visible: 1,
        scope: 'both',
      },
    });
    assert.strictEqual(createDishRes.status, 200);
    tempDishId = createDishRes.data.id;
    assert.ok(tempDishId);

    // Public sync check: Category should now appear in /api/public/menu/main
    const pubRes = await request('/api/public/menu/main');
    const foundCatInPub = pubRes.data.categories.find(c => c.id === createdCatId);
    assert.ok(foundCatInPub, 'New category with dish did not sync to public menu');
    assert.strictEqual(foundCatInPub.name, testCatName);

    // Cleanup: Delete test dish and test category
    await request(`/api/admin/dishes/${tempDishId}`, { method: 'DELETE' });
    const delCatRes = await request(`/api/admin/categories/${createdCatId}`, { method: 'DELETE' });
    assert.strictEqual(delCatRes.status, 200);

    // Public removal sync check
    const pubResAfter = await request('/api/public/menu/main');
    const foundAfter = pubResAfter.data.categories.find(c => c.id === createdCatId);
    assert.strictEqual(foundAfter, undefined, 'Deleted category still visible in public menu');
  });

  // 4. WEBSITE CONTENT & PUBLIC SYNC
  await test('4.1 LIVE SYNC: Update contact phone and verify instant update on public site API', async () => {
    const siteContentRes = await request('/api/admin/site-content');
    assert.strictEqual(siteContentRes.status, 200);
    const origContact = siteContentRes.data.contact || {};
    const originalPhone = origContact.phone || '+91 91586 16688';

    const testPhone = '+91 99999 00000';
    const updateRes = await request('/api/admin/site-content/contact', {
      method: 'PUT',
      body: {
        ...origContact,
        phone: testPhone,
      },
    });
    assert.strictEqual(updateRes.status, 200);

    // Check public site content at /api/public/site
    const pubContent = await request('/api/public/site');
    assert.strictEqual(pubContent.status, 200);
    assert.strictEqual(pubContent.data.content.contact.phone, testPhone, 'Public site content did not sync phone update');

    // Revert phone
    await request('/api/admin/site-content/contact', {
      method: 'PUT',
      body: {
        ...origContact,
        phone: originalPhone,
      },
    });

    const revertedPub = await request('/api/public/site');
    assert.strictEqual(revertedPub.data.content.contact.phone, originalPhone);
  });

  await test('4.2 GET popular-dishes, gallery, legal and seo endpoints return valid arrays', async () => {
    const popRes = await request('/api/admin/popular-dishes');
    assert.strictEqual(popRes.status, 200);
    assert.ok(Array.isArray(popRes.data));

    const galRes = await request('/api/admin/gallery');
    assert.strictEqual(galRes.status, 200);
    assert.ok(Array.isArray(galRes.data));

    const legalRes = await request('/api/admin/legal-pages');
    assert.strictEqual(legalRes.status, 200);
    assert.ok(Array.isArray(legalRes.data));

    const seoRes = await request('/api/admin/seo-pages');
    assert.strictEqual(seoRes.status, 200);
    assert.ok(Array.isArray(seoRes.data));
  });

  // 5. REVIEWS & GOOGLE LINK SYNC
  await test('5.1 LIVE SYNC: Update Google review link and verify instant sync with /api/public/review-config', async () => {
    const configRes = await request('/api/admin/reviews/config');
    assert.strictEqual(configRes.status, 200);
    const originalLink = configRes.data.googleReviewUrl || configRes.data.google_review_url;

    const testLink = 'https://search.google.com/local/writereview?placeid=ChIJs1lJkU3bxTsRjoXzzGxpTGw';
    const updateRes = await request('/api/admin/reviews/google-link', {
      method: 'PUT',
      body: {
        url: testLink,
      },
    });
    assert.strictEqual(updateRes.status, 200);

    // Check public review config
    const pubConfig = await request('/api/public/review-config');
    assert.strictEqual(pubConfig.status, 200);
    const resolvedUrl = pubConfig.data.googleReviewUrl || pubConfig.data.google_review_url;
    assert.strictEqual(resolvedUrl, testLink, 'Public review config did not sync google review url');

    // Revert link
    await request('/api/admin/reviews/google-link', {
      method: 'PUT',
      body: {
        url: originalLink,
      },
    });

    const revertedPub = await request('/api/public/review-config');
    const revertedUrl = revertedPub.data.googleReviewUrl || revertedPub.data.google_review_url;
    assert.strictEqual(revertedUrl, originalLink);
  });

  await test('5.2 Reviews Options CRUD and Stats work properly', async () => {
    const statsRes = await request('/api/admin/reviews/stats');
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.data.started !== undefined);

    // Create test review option
    const optRes = await request('/api/admin/reviews/options', {
      method: 'POST',
      body: {
        label: 'Test Option Taste',
        ai_hint: 'Mention great flavor and fresh spices',
        is_visible: 1,
      },
    });
    assert.strictEqual(optRes.status, 200);
    const optId = optRes.data.id;
    assert.ok(optId);

    // Update test option
    const updateOptRes = await request(`/api/admin/reviews/options/${optId}`, {
      method: 'PUT',
      body: {
        label: 'Test Option Taste Updated',
        is_visible: 0,
      },
    });
    assert.strictEqual(updateOptRes.status, 200);

    // Delete test option
    const delOptRes = await request(`/api/admin/reviews/options/${optId}`, {
      method: 'DELETE',
    });
    assert.strictEqual(delOptRes.status, 200);
  });

  // 6. QR CODES & DYNAMIC REDIRECT
  await test('6.1 QR Codes list, update destination, and verify /q/menu dynamic redirect', async () => {
    const qrListRes = await request('/api/admin/qr-codes');
    assert.strictEqual(qrListRes.status, 200);
    assert.ok(Array.isArray(qrListRes.data));

    // Update destination of 'menu'
    const updateRes = await request('/api/admin/qr-codes/menu', {
      method: 'PUT',
      body: {
        label: 'Main Table Menu Stand',
        destination: '/menu?source=qr-table',
        is_enabled: 1,
      },
    });
    assert.strictEqual(updateRes.status, 200);

    // Test redirect at /q/menu
    const redirectRes = await fetch(`${BASE_URL}/q/menu`, { redirect: 'manual' });
    assert.strictEqual(redirectRes.status, 302);
    assert.strictEqual(redirectRes.headers.get('location'), '/menu?source=qr-table');

    // Revert destination
    await request('/api/admin/qr-codes/menu', {
      method: 'PUT',
      body: {
        destination: '/menu',
        is_enabled: 1,
      },
    });
  });

  await test('6.2 QR Code download endpoint produces PNG', async () => {
    const dlRes = await request('/api/admin/qr-codes/menu/download?format=png');
    assert.strictEqual(dlRes.status, 200);
    assert.ok(dlRes.headers.get('content-type').includes('image/png'));
  });

  // 7. SETTINGS & EXPORTS
  await test('7.1 GET /api/admin/settings and PUT /api/admin/settings work correctly', async () => {
    const settingsRes = await request('/api/admin/settings');
    assert.strictEqual(settingsRes.status, 200);
    assert.ok(typeof settingsRes.data.special_markup_percent === 'number');

    const updateRes = await request('/api/admin/settings', {
      method: 'PUT',
      body: {
        special_markup_percent: 10,
        rounding_step: 1,
      },
    });
    assert.strictEqual(updateRes.status, 200);
  });

  await test('7.2 PUT /api/admin/auth/credentials validates current password and updates account', async () => {
    // Bad current password fails
    const badRes = await request('/api/admin/auth/credentials', {
      method: 'PUT',
      body: {
        email: ADMIN_EMAIL,
        current_password: 'WrongPassword123',
      },
    });
    assert.strictEqual(badRes.status, 400);

    // Correct current password succeeds without mutating password
    const goodRes = await request('/api/admin/auth/credentials', {
      method: 'PUT',
      body: {
        email: ADMIN_EMAIL,
        current_password: ADMIN_PASS,
      },
    });
    assert.strictEqual(goodRes.status, 200);
    assert.strictEqual(goodRes.data.success, true);
  });

  await test('7.3 Export endpoints (JSON backup, Scans CSV, Reviews CSV) return data', async () => {
    const contentRes = await request('/api/admin/export/content');
    assert.strictEqual(contentRes.status, 200);
    assert.ok(contentRes.data.dishes);
    assert.ok(contentRes.data.categories);

    const scansRes = await request('/api/admin/export/scans');
    assert.strictEqual(scansRes.status, 200);
    assert.ok(scansRes.headers.get('content-type').includes('text/csv'));

    const reviewsRes = await request('/api/admin/export/reviews');
    assert.strictEqual(reviewsRes.status, 200);
    assert.ok(reviewsRes.headers.get('content-type').includes('text/csv'));
  });

  // 8. LOGOUT & SESSION TERMINATION
  await test('8.1 POST /api/admin/auth/logout clears session', async () => {
    const logoutRes = await request('/api/admin/auth/logout', {
      method: 'POST',
      body: {},
    });
    assert.strictEqual(logoutRes.status, 200);

    const meRes = await request('/api/admin/auth/me');
    assert.strictEqual(meRes.status, 401);
  });

  console.log('\n=================================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

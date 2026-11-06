import assert from 'assert';
import { query } from '../server/db/connection.js';

const BASE_URL = 'http://localhost:3001';

async function main() {
  console.log('====================================================');
  console.log('E2E TEST: GALLERY CRUD & SYNC + REAL QR SCAN ACCURACY');
  console.log('====================================================\n');

  // ------------------------------------------------------------------
  // 1. VERIFY TEST SUITE / SCRIPT DOES NOT POLLUTE SCANS TABLE
  // ------------------------------------------------------------------
  console.log('1. Testing QR scan filtering for automated requests...');
  const countBefore = await query('SELECT COUNT(*) as c FROM scans');
  const initialCount = parseInt(countBefore[0].c, 10);
  console.log(`   Initial scans in DB: ${initialCount}`);

  // Ping /q/menu with node fetch (automated request)
  const autoRes = await fetch(`${BASE_URL}/q/menu`, { redirect: 'manual' });
  assert.strictEqual(autoRes.status, 302, 'Automated request should redirect 302');
  assert.ok(autoRes.headers.get('location'), 'Redirect location should exist');

  // Ping with explicit x-test-suite header
  const suiteRes = await fetch(`${BASE_URL}/q/menu`, {
    redirect: 'manual',
    headers: { 'x-test-suite': 'true' },
  });
  assert.strictEqual(suiteRes.status, 302, 'Suite request should redirect 302');

  const countAfterAuto = await query('SELECT COUNT(*) as c FROM scans');
  const countAfterAutoNum = parseInt(countAfterAuto[0].c, 10);
  assert.strictEqual(
    countAfterAutoNum,
    initialCount,
    `Automated / test requests MUST NOT increment scans table (expected ${initialCount}, got ${countAfterAutoNum})`
  );
  console.log('   ✓ PASS: Automated test requests properly ignored by scans table');

  // ------------------------------------------------------------------
  // 2. VERIFY REALISTIC MOBILE USER SCAN INCREMENTS TABLE
  // ------------------------------------------------------------------
  console.log('\n2. Testing simulated genuine customer phone scan...');
  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  const customerRes = await fetch(`${BASE_URL}/q/menu`, {
    redirect: 'manual',
    headers: {
      'User-Agent': mobileUA,
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  assert.strictEqual(customerRes.status, 302, 'Customer phone scan must redirect 302');

  // Small delay for async non-blocking log
  await new Promise((r) => setTimeout(r, 400));

  const countAfterCustomer = await query('SELECT COUNT(*) as c FROM scans');
  const countAfterCustomerNum = parseInt(countAfterCustomer[0].c, 10);
  assert.strictEqual(
    countAfterCustomerNum,
    initialCount + 1,
    `Genuine customer phone scan must increment scans table (expected ${initialCount + 1}, got ${countAfterCustomerNum})`
  );
  console.log(`   ✓ PASS: Customer phone scan logged (scans = ${countAfterCustomerNum})`);

  // Clean up the simulated scan so the DB remains purely 0 for real customers
  await query("DELETE FROM scans WHERE device_type = 'iOS' AND browser = 'Safari'");
  const finalCleanCount = await query('SELECT COUNT(*) as c FROM scans');
  console.log(`   Cleaned simulated scan; DB scans restored to: ${finalCleanCount[0].c}`);

  // ------------------------------------------------------------------
  // 3. ADMIN LOGIN & CSRF TOKEN RETRIEVAL
  // ------------------------------------------------------------------
  console.log('\n3. Admin authentication...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@amolvegresto.in', password: 'Admin@nirvanaa26' }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const setCookie = loginRes.headers.get('set-cookie');
  assert.ok(setCookie, 'Session cookie must be set');

  const meRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { cookie: setCookie },
  });
  const meData = await meRes.json();
  const csrfToken = meData.csrfToken || '';
  console.log('   ✓ PASS: Admin authenticated with session cookie');

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'cookie': setCookie,
    'x-csrf-token': csrfToken,
  };

  // ------------------------------------------------------------------
  // 4. VERIFY PUBLIC GALLERY INITIAL STATE
  // ------------------------------------------------------------------
  console.log('\n4. Verifying public gallery API initial state...');
  const pubInitialRes = await fetch(`${BASE_URL}/api/public/gallery`);
  assert.strictEqual(pubInitialRes.status, 200, 'Public gallery endpoint should return 200');
  const pubInitialItems = await pubInitialRes.json();
  assert.ok(Array.isArray(pubInitialItems), 'Public gallery items must be an array');
  assert.strictEqual(pubInitialItems.length, 7, 'Public gallery should contain 7 seeded photos');
  console.log(`   ✓ PASS: Public gallery initially serves ${pubInitialItems.length} photos`);

  // ------------------------------------------------------------------
  // 5. ADD NEW PHOTO VIA ADMIN API & VERIFY LIVE SYNC
  // ------------------------------------------------------------------
  console.log('\n5. Adding a new photo via Admin API and testing live sync...');
  const newPhotoPayload = {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop&q=80',
    alt_text: 'Test Hand-Tossed Thin Crust Veggie Pizza',
    caption: 'Fresh oven-baked pizza loaded with garden vegetables.',
    category: 'food',
    aspect: 'standard',
    is_visible: 1,
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/gallery`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(newPhotoPayload),
  });
  assert.strictEqual(createRes.status, 200, 'Create gallery photo should succeed');
  const createData = await createRes.json();
  assert.ok(createData.id, 'Created photo must return an ID');
  const createdPhotoId = createData.id;
  console.log(`   Created photo ID: ${createdPhotoId}`);

  // Verify instant live reflection on public API without restarting server
  const pubAfterAddRes = await fetch(`${BASE_URL}/api/public/gallery`);
  const pubAfterAddItems = await pubAfterAddRes.json();
  assert.strictEqual(
    pubAfterAddItems.length,
    8,
    `Public gallery must immediately reflect 8 items (live sync), got ${pubAfterAddItems.length}`
  );
  const foundNew = pubAfterAddItems.find((i) => i.id === createdPhotoId);
  assert.ok(foundNew, 'Newly created photo must exist in public gallery payload');
  assert.strictEqual(foundNew.alt_text, newPhotoPayload.alt_text);
  console.log('   ✓ PASS: Newly added photo immediately appears on public website (live sync)');

  // ------------------------------------------------------------------
  // 6. UPDATE PHOTO VIA ADMIN API & VERIFY LIVE SYNC
  // ------------------------------------------------------------------
  console.log('\n6. Updating photo details and testing live sync...');
  const updatePayload = {
    ...foundNew,
    alt_text: 'Updated Crisp Vegetable Supreme Pizza',
    caption: 'Updated artisan style pizza with fresh mozzarella and basil.',
  };

  const updateRes = await fetch(`${BASE_URL}/api/admin/gallery/${createdPhotoId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify(updatePayload),
  });
  assert.strictEqual(updateRes.status, 200, 'Update gallery photo should succeed');

  const pubAfterUpdateRes = await fetch(`${BASE_URL}/api/public/gallery`);
  const pubAfterUpdateItems = await pubAfterUpdateRes.json();
  const foundUpdated = pubAfterUpdateItems.find((i) => i.id === createdPhotoId);
  assert.strictEqual(
    foundUpdated.alt_text,
    'Updated Crisp Vegetable Supreme Pizza',
    'Updated alt text must immediately reflect on public API'
  );
  console.log('   ✓ PASS: Updated photo details immediately synced to public website');

  // ------------------------------------------------------------------
  // 7. DELETE PHOTO VIA ADMIN API & VERIFY LIVE SYNC
  // ------------------------------------------------------------------
  console.log('\n7. Deleting photo and testing live sync...');
  const deleteRes = await fetch(`${BASE_URL}/api/admin/gallery/${createdPhotoId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert.strictEqual(deleteRes.status, 200, 'Delete gallery photo should succeed');

  const pubAfterDeleteRes = await fetch(`${BASE_URL}/api/public/gallery`);
  const pubAfterDeleteItems = await pubAfterDeleteRes.json();
  assert.strictEqual(
    pubAfterDeleteItems.length,
    7,
    `Public gallery must immediately return to 7 items after deletion, got ${pubAfterDeleteItems.length}`
  );
  const foundDeleted = pubAfterDeleteItems.find((i) => i.id === createdPhotoId);
  assert.strictEqual(foundDeleted, undefined, 'Deleted photo must not exist in public gallery');
  console.log('   ✓ PASS: Deleted photo immediately removed from public website (live sync)');

  console.log('\n====================================================');
  console.log('ALL TESTS PASSED: SCAN ACCURACY & GALLERY LIVE SYNC VERIFIED');
  console.log('====================================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});


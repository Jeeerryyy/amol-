import { chromium } from 'playwright';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const API_BASE = 'http://localhost:3001';
const SITE_BASE = 'http://localhost:5173';

async function runTests() {
  console.log('========================================================================');
  console.log('STARTING DYNAMIC QR SYSTEM & REVIEW QR TEST SUITE');
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

  const db = new DatabaseSync(path.resolve('data/restaurant.db'));
  db.exec('PRAGMA busy_timeout = 5000;');

  // -------------------------------------------------------------------------
  // 1. DATABASE & SEED CHECKS
  // -------------------------------------------------------------------------
  console.log('\n--- 1. DATABASE QR SEED & SLUG CHECKS ---');
  const reviewQr = db.prepare("SELECT * FROM qr_codes WHERE id = 'review' OR slug = 'review'").get();
  assert(reviewQr !== undefined, 'Review QR exists in database');
  assert(reviewQr?.slug === 'review', `Review QR slug is "review" (actual: ${reviewQr?.slug})`);
  assert(reviewQr?.destination === '/review', `Review QR destination is "/review" (actual: ${reviewQr?.destination})`);
  assert(reviewQr?.is_enabled === 1, 'Review QR is active by default');

  const allQrs = db.prepare("SELECT * FROM qr_codes").all();
  assert(allQrs.length >= 3, `Database has at least 3 dynamic QR codes (found: ${allQrs.length})`);
  for (const q of allQrs) {
    assert(Boolean(q.slug), `QR "${q.label}" has a valid slug: "${q.slug}"`);
  }

  // -------------------------------------------------------------------------
  // 2. DYNAMIC REDIRECT & SCAN LOGGING CHECKS (/qr/:slug and /q/:slug)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. DYNAMIC REDIRECT & SCAN LOGGING CHECKS ---');

  // Count scans before test
  const scansBefore = db.prepare("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'review'").get().count;

  // Test Review QR redirect: simulate mobile iPhone user
  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  const startT = performance.now();
  const resReview = await fetch(`${API_BASE}/qr/review`, {
    headers: { 'User-Agent': mobileUA },
    redirect: 'manual',
  });
  const elapsed = performance.now() - startT;

  assert(resReview.status === 302, `Review QR returned HTTP 302 (status: ${resReview.status})`);
  const reviewLocation = resReview.headers.get('location');
  assert(reviewLocation === '/review', `Review QR redirected to "/review" (location: ${reviewLocation})`);
  assert(elapsed < 250, `Fast redirect performance: ${elapsed.toFixed(1)}ms (< 250ms)`);
  assert(resReview.headers.get('cache-control')?.includes('no-store'), 'Cache-Control header contains "no-store"');

  // Verify scan was recorded in database
  await new Promise(r => setTimeout(r, 200));
  const scansAfter = db.prepare("SELECT COUNT(*) as count FROM scans WHERE qr_id = 'review'").get().count;
  assert(scansAfter > scansBefore, `Scan count incremented in scans table (before: ${scansBefore}, after: ${scansAfter})`);

  const latestScan = db.prepare("SELECT * FROM scans WHERE qr_id = 'review' ORDER BY created_at DESC LIMIT 1").get();
  assert(latestScan.device_type === 'iOS', `Scan logged device type as iOS (actual: ${latestScan.device_type})`);
  assert(latestScan.os === 'iOS', `Scan logged OS as iOS (actual: ${latestScan.os})`);
  assert(latestScan.browser === 'Safari', `Scan logged browser as Safari (actual: ${latestScan.browser})`);
  assert(Boolean(latestScan.created_at), `Scan logged exact ISO timestamp: ${latestScan.created_at}`);

  // Test backward compatible /q/:code endpoint as well
  const resLegacy = await fetch(`${API_BASE}/q/menu`, { redirect: 'manual' });
  assert(resLegacy.status === 302, `/q/menu backward compatible route works (status: ${resLegacy.status})`);

  // -------------------------------------------------------------------------
  // 3. EDITABLE DESTINATION WITHOUT REPRINT
  // -------------------------------------------------------------------------
  console.log('\n--- 3. EDITABLE DESTINATION TEST ---');
  // Edit destination to custom promotion URL
  db.prepare("UPDATE qr_codes SET destination = '/special-menu/?promo=weekend' WHERE id = 'review'").run();

  const resUpdated = await fetch(`${API_BASE}/qr/review`, { redirect: 'manual' });
  const updatedLocation = resUpdated.headers.get('location');
  assert(
    updatedLocation === '/special-menu/?promo=weekend',
    `QR redirected to newly updated destination without reprint: ${updatedLocation}`
  );

  // Restore back to /review
  db.prepare("UPDATE qr_codes SET destination = '/review' WHERE id = 'review'").run();

  // -------------------------------------------------------------------------
  // 4. FALLBACK PAGE CHECKS (PAUSED, EMPTY LINK, UNKNOWN)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. FALLBACK PAGES TEST ---');

  // 4.1 Paused QR fallback page
  db.prepare("UPDATE qr_codes SET is_enabled = 0 WHERE id = 'review'").run();
  const resPaused = await fetch(`${API_BASE}/qr/review`, { redirect: 'manual' });
  const pausedHtml = await resPaused.text();
  assert(resPaused.status === 503, `Paused QR returns 503 status (status: ${resPaused.status})`);
  assert(pausedHtml.includes('QR Stand Temporarily Paused'), 'Paused fallback page contains "QR Stand Temporarily Paused"');
  assert(pausedHtml.includes('Browse Digital Menu'), 'Fallback page includes link to digital menu');

  // 4.2 Empty link fallback page
  db.prepare("UPDATE qr_codes SET is_enabled = 1, destination = '' WHERE id = 'review'").run();
  const resEmpty = await fetch(`${API_BASE}/qr/review`, { redirect: 'manual' });
  const emptyHtml = await resEmpty.text();
  assert(emptyHtml.includes('Destination In Progress'), 'Empty destination returns "Destination In Progress" fallback page');

  // Restore active and destination
  db.prepare("UPDATE qr_codes SET is_enabled = 1, destination = '/review' WHERE id = 'review'").run();

  // 4.3 Unknown QR fallback page
  const resUnknown = await fetch(`${API_BASE}/qr/non-existent-code`, { redirect: 'manual' });
  const unknownHtml = await resUnknown.text();
  assert(resUnknown.status === 404, `Unknown QR returns 404 status (status: ${resUnknown.status})`);
  assert(unknownHtml.includes('QR Code Not Found'), 'Unknown QR returns "QR Code Not Found" fallback page');

  // -------------------------------------------------------------------------
  // 5. PRINT-READY ASSET DOWNLOADS (PNG, SVG, A5 PDF)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. PRINT-READY ASSET DOWNLOADS ---');

  const unauthDownload = await fetch(`${API_BASE}/api/admin/qr-codes/review/download?format=png`);
  assert(unauthDownload.status === 401, 'Unauthenticated QR download is rejected (401)');

  const loginRes = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'owner@amolvegresto.in',
      password: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@nirvanaa26',
    }),
  });
  assert(loginRes.status === 200, 'Admin authentication succeeded for QR asset download tests');
  const rawSetCookie = loginRes.headers.get('set-cookie') || '';
  const sessionCookie = rawSetCookie.split(';')[0];
  const authHeaders = sessionCookie ? { Cookie: sessionCookie } : {};

  const resPng = await fetch(`${API_BASE}/api/admin/qr-codes/review/download?format=png`, { headers: authHeaders });
  assert(resPng.status === 200, `PNG download status is 200`);
  assert(resPng.headers.get('content-type') === 'image/png', `PNG Content-Type is image/png`);
  const pngBuffer = await resPng.arrayBuffer();
  assert(pngBuffer.byteLength > 2000, `PNG file has valid size (${pngBuffer.byteLength} bytes)`);

  const resSvg = await fetch(`${API_BASE}/api/admin/qr-codes/review/download?format=svg`, { headers: authHeaders });
  assert(resSvg.status === 200, `SVG download status is 200`);
  assert(resSvg.headers.get('content-type')?.includes('svg'), `SVG Content-Type is svg+xml`);
  const svgText = await resSvg.text();
  assert(svgText.includes('<svg') && svgText.includes('</svg>'), 'SVG body contains valid SVG tags');

  const resPdf = await fetch(`${API_BASE}/api/admin/qr-codes/review/download?format=pdf`, { headers: authHeaders });
  assert(resPdf.status === 200, `PDF download status is 200`);
  assert(resPdf.headers.get('content-type') === 'application/pdf', `PDF Content-Type is application/pdf`);
  const pdfBuffer = await resPdf.arrayBuffer();
  const pdfHeader = Buffer.from(pdfBuffer.slice(0, 5)).toString();
  assert(pdfHeader.startsWith('%PDF-'), `PDF starts with %PDF- magic bytes (header: ${pdfHeader})`);
  assert(pdfBuffer.byteLength > 5000, `PDF file has valid size (${pdfBuffer.byteLength} bytes)`);

  // -------------------------------------------------------------------------
  // 6. ADMIN UI PLAYWRIGHT TEST
  // -------------------------------------------------------------------------
  console.log('\n--- 6. ADMIN UI TESTING (PLAYWRIGHT) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // Login to admin panel
    await page.goto(`${SITE_BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'owner@amolvegresto.in');
    await page.fill('input[type="password"]', 'Admin@nirvanaa26');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.admin-nav-item', { timeout: 10000 });

    // Navigate to QR Codes
    await page.click('.admin-nav-item:has-text("QR Codes")');
    await page.waitForSelector('.admin-card', { timeout: 8000 });

    // Verify Review QR is displayed
    const reviewCard = page.locator('.admin-card:has-text("Review Us")');
    assert((await reviewCard.count()) > 0, 'Admin QR codes view displays "Review Us" card');

    const cardSlug = await reviewCard.locator('.admin-badge:has-text("Slug: /qr/review")').count();
    assert(cardSlug > 0, 'Review QR card displays "Slug: /qr/review"');

    const scanCountVisible = await reviewCard.locator('text=Total Scans Logged').isVisible();
    assert(scanCountVisible, 'Total scans logged count is visible on Review QR card');

    // Test Edit Mode
    await reviewCard.locator('button:has-text("Edit Destination & Slug")').click();
    await page.waitForTimeout(300);

    const editLabelInput = reviewCard.locator('input[placeholder="Enter label"]');
    assert(await editLabelInput.isVisible(), 'Edit mode opened and label input is visible');

    // Test quick preset button in edit mode
    const presetBtn = reviewCard.locator('button:has-text("Review Page")');
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
      const destVal = await reviewCard.locator('input[placeholder*="/menu/"]').inputValue();
      assert(destVal === '/review', `Quick preset filled "/review" into destination input (actual: "${destVal}")`);
    }

    await reviewCard.locator('button:has-text("Cancel")').click();
    await page.waitForTimeout(200);

    // Test 1-click status toggle
    const statusBtn = reviewCard.locator('button.admin-badge:has-text("Active")');
    if (await statusBtn.isVisible()) {
      await statusBtn.click();
      await page.waitForTimeout(500);
      const pausedBtn = reviewCard.locator('button.admin-badge:has-text("Paused")');
      assert((await pausedBtn.count()) > 0, 'One-click toggle switched status to "Paused"');

      // Toggle back to active
      await pausedBtn.click();
      await page.waitForTimeout(500);
      const activeAgain = reviewCard.locator('button.admin-badge:has-text("Active")');
      assert((await activeAgain.count()) > 0, 'One-click toggle switched status back to "Active"');
    }

    // Test that the Review QR link opens the Review Page flow
    console.log('\n--- 7. REVIEW PAGE FLOW DIRECT INTEGRATION CHECK ---');
    await page.goto(`${SITE_BASE}/qr/review`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const currentUrl = page.url();
    assert(currentUrl.includes('/review'), `Scanning /qr/review opens review page flow directly: ${currentUrl}`);

    // Check 5 stars on the review page
    const stars = await page.locator('.star-btn, .review-star, [aria-label*="star"]').count();
    assert(stars >= 5, `Review page loaded successfully with ${stars} rating stars`);

  } catch (err) {
    console.error('Playwright UI error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log(`DYNAMIC QR TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

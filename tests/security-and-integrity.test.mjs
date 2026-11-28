import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amol-sec-test-'));
const tempDbPath = path.join(tempDir, 'test.db');

// Configure isolated test environment BEFORE dynamically importing server modules
process.env.SQLITE_DB_PATH = tempDbPath;
process.env.DISABLE_AUTO_LISTEN = '1';
process.env.DATABASE_URL = '';
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.ALLOWED_ORIGIN = 'http://localhost:5173';
process.env.SITE_URL = 'https://amolvegresto.in';
process.env.ADMIN_EMAIL = 'testowner@amolvegresto.in';
process.env.ADMIN_INITIAL_PASSWORD = 'TestOwnerPass@2026';

describe('Security, Database & API Integrity Suite', () => {
  let server;
  let baseUrl;
  let query;
  let translateSqlToSqlite;
  let closeDb;
  let escapeCsvCell;
  let exportScansCsv;
  let recalculateAllNonOverriddenPrices;

  before(async () => {
    const conn = await import('../server/db/connection.js');
    query = conn.query;
    translateSqlToSqlite = conn.translateSqlToSqlite;
    closeDb = conn.closeDb;

    const exp = await import('../server/services/exportService.js');
    escapeCsvCell = exp.escapeCsvCell;
    exportScansCsv = exp.exportScansCsv;

    const pricing = await import('../server/services/pricingService.js');
    recalculateAllNonOverriddenPrices = pricing.recalculateAllNonOverriddenPrices;

    const srvMod = await import('../server/index.js');
    await srvMod.dbReadyPromise;

    await new Promise((resolve) => {
      server = srvMod.default.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (closeDb) {
      await closeDb();
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('expands reused PostgreSQL $N positional parameters safely for SQLite', async () => {
    const res = translateSqlToSqlite(
      "SELECT * FROM dishes WHERE (LOWER(name) LIKE $1 OR LOWER(description) LIKE $1) AND scope = $2 AND note != '$1'",
      ['%dosa%', 'both']
    );
    assert.equal(
      res.sqliteSql,
      "SELECT * FROM dishes WHERE (LOWER(name) LIKE ? OR LOWER(description) LIKE ?) AND scope = ? AND note != '$1'"
    );
    assert.deepEqual(res.sqliteParams, ['%dosa%', '%dosa%', 'both']);

    const rows = await query('SELECT * FROM qr_codes WHERE id = $1 OR slug = $1', ['menu']);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].slug, 'menu');
  });

  it('prevents CSV formula injection and validates export date query params', async () => {
    assert.equal(escapeCsvCell('=CMD()'), `"'=CMD()"`);
    assert.equal(escapeCsvCell('+1+2'), `"'+1+2"`);
    assert.equal(escapeCsvCell('-SUM(A1)'), `"'-SUM(A1)"`);
    assert.equal(escapeCsvCell('@cmd'), `"'@cmd"`);
    assert.equal(escapeCsvCell('\t=1'), `"'\t=1"`);
    assert.equal(escapeCsvCell('say "hi"'), `"say ""hi"""`);

    await assert.rejects(
      () => exportScansCsv({ from: 'not-a-real-date' }),
      (err) => err.statusCode === 400
    );
  });

  it('recalculates both-scope variant prices (including 0% markup) without mutating special_only variants', async () => {
    const now = new Date().toISOString();
    await query("UPDATE settings SET value = '0' WHERE key = 'special_markup_percent'");

    const [cat] = await query('SELECT id FROM categories LIMIT 1');
    const spDishId = `dish_special_only_test_${Date.now()}`;
    const spVarId = `${spDishId}_var_0`;

    await query(
      `INSERT INTO dishes (id, name, description, category_id, price_type, base_price, special_price, is_available, is_visible, scope, sort_order, created_at, updated_at)
       VALUES ($1, 'Test Special Platter', '', $2, 'variants', 250, 250, 1, 1, 'special_only', 999, $3, $4)`,
      [spDishId, cat.id, now, now]
    );
    await query(
      `INSERT INTO dish_variants (id, dish_id, label, base_price, special_price, special_price_override, sort_order, created_at)
       VALUES ($1, $2, 'Half', 150, 299, NULL, 0, $3)`,
      [spVarId, spDishId, now]
    );

    await recalculateAllNonOverriddenPrices();

    const [spVarAfter] = await query('SELECT special_price FROM dish_variants WHERE id = $1', [spVarId]);
    assert.equal(spVarAfter.special_price, 299, 'special_only variant special_price must not be overwritten');

    const [bothDish] = await query("SELECT base_price, special_price FROM dishes WHERE scope = 'both' AND price_type = 'single' AND special_price_override IS NULL LIMIT 1");
    assert.equal(bothDish.special_price, bothDish.base_price, '0% markup should yield base_price === special_price');
  });

  it('enforces CORS allowlist and rejects untrusted third-party *.vercel.app origins', async () => {
    const badRes = await fetch(`${baseUrl}/api/public/site`, {
      headers: { Origin: 'https://evil-attacker.vercel.app' },
    });
    assert.equal(badRes.headers.get('access-control-allow-origin'), null);

    const goodRes = await fetch(`${baseUrl}/api/public/site`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(goodRes.status, 200);
    assert.equal(goodRes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

  it('blocks LIKE wildcard session wipe attacks, requires auth on QR download, and validates inputs', async () => {
    // 1. Login legitimate Session A & Session B
    const loginA = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_INITIAL_PASSWORD }),
    });
    assert.equal(loginA.status, 200);
    const dataA = await loginA.json();
    const cookieA = loginA.headers.get('set-cookie').split(';')[0];

    const loginB = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_INITIAL_PASSWORD }),
    });
    assert.equal(loginB.status, 200);
    const cookieB = loginB.headers.get('set-cookie').split(';')[0];

    // 2. Attacker sends wildcard cookie '%' to logout & me endpoints
    const wildcardMe = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: { Cookie: 'amol_admin_session=%' },
    });
    assert.equal(wildcardMe.status, 401);

    await fetch(`${baseUrl}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: 'amol_admin_session=%' },
    });

    // Legitimate Session A must remain intact!
    const meA = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(meA.status, 200, 'Wildcard logout cookie must not terminate valid admin sessions');

    // 3. Unauthenticated QR download is denied (401), authenticated succeeds (200)
    const unauthQr = await fetch(`${baseUrl}/api/admin/qr-codes/menu/download?format=png`);
    assert.equal(unauthQr.status, 401);

    const authQr = await fetch(`${baseUrl}/api/admin/qr-codes/menu/download?format=png`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(authQr.status, 200);
    assert.equal(authQr.headers.get('content-type'), 'image/png');

    // 4. Unsafe javascript: URLs rejected on QR codes and Menu Buttons
    const badQr = await fetch(`${baseUrl}/api/admin/qr-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieA,
        'X-CSRF-Token': dataA.csrfToken,
      },
      body: JSON.stringify({ label: 'XSS QR', slug: 'xss-qr', destination: 'javascript:alert(1)' }),
    });
    assert.equal(badQr.status, 400);

    const badBtn = await fetch(`${baseUrl}/api/admin/menu-buttons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieA,
        'X-CSRF-Token': dataA.csrfToken,
      },
      body: JSON.stringify({ type: 'custom', label: 'XSS Btn', url: 'javascript:alert(1)' }),
    });
    assert.equal(badBtn.status, 400);

    // 5. Dish special_price_override = 0 is preserved cleanly
    const [cat] = await query('SELECT id FROM categories LIMIT 1');
    const dishRes = await fetch(`${baseUrl}/api/admin/dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieA,
        'X-CSRF-Token': dataA.csrfToken,
      },
      body: JSON.stringify({
        name: 'Zero Promo Test Dish',
        category_id: cat.id,
        price_type: 'single',
        base_price: 120,
        special_price_override: 0,
        scope: 'both',
      }),
    });
    assert.equal(dishRes.status, 200);
    const dishJson = await dishRes.json();
    const [savedDish] = await query('SELECT special_price, special_price_override FROM dishes WHERE id = $1', [dishJson.id]);
    assert.equal(savedDish.special_price, 0);
    assert.equal(savedDish.special_price_override, 0);

    // 6. Dashboard numeric types + SEO page_name
    const dashRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(dashRes.status, 200);
    const dash = await dashRes.json();
    assert.equal(typeof dash.menuHealth.specialMenuCount, 'number');

    const seoRes = await fetch(`${baseUrl}/api/admin/seo-pages`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(seoRes.status, 200);
    const seoPages = await seoRes.json();
    assert.ok(seoPages.length > 0 && typeof seoPages[0].page_name === 'string' && seoPages[0].page_name.length > 0);

    // 7. Public Contact Inquiry persistence & Admin retrieval (XSS sanitized)
    const badContact = await fetch(`${baseUrl}/api/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', phone: 'invalid', message: 'hi' }),
    });
    assert.equal(badContact.status, 400);

    const goodContact = await fetch(`${baseUrl}/api/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya <script>alert(1)</script>',
        phone: '+91 9876543210',
        email: 'guest@example.com',
        message: 'Table booking for 4 at 8 PM <img src=x onerror=alert(1)>',
      }),
    });
    assert.equal(goodContact.status, 201);

    const inqRes = await fetch(`${baseUrl}/api/admin/inquiries`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(inqRes.status, 200);
    const inquiries = await inqRes.json();
    assert.equal(inquiries.length, 1);
    assert.ok(!inquiries[0].message.includes('<img'), 'HTML tags must be stripped from contact inquiry');

    // 8. Legal API returns content_html
    const legalRes = await fetch(`${baseUrl}/api/public/legal/privacy-policy`);
    assert.equal(legalRes.status, 200);
    const legalData = await legalRes.json();
    assert.ok(typeof legalData.content_html === 'string' && legalData.content_html.length > 0);

    // 9. Password change validates input and invalidates other active sessions (Session B)
    const credUpdate = await fetch(`${baseUrl}/api/admin/auth/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieA,
        'X-CSRF-Token': dataA.csrfToken,
      },
      body: JSON.stringify({
        currentPassword: process.env.ADMIN_INITIAL_PASSWORD,
        newPassword: 'NewUpdatedPassword@2026',
      }),
    });
    assert.equal(credUpdate.status, 200);

    const checkSessionB = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: { Cookie: cookieB },
    });
    assert.equal(checkSessionB.status, 401, 'Other admin sessions must be invalidated on password update');

    const checkSessionA = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: { Cookie: cookieA },
    });
    assert.equal(checkSessionA.status, 200, 'Current updater session stays valid');
  });

  it('verifies generated HTML shells contain no TODO placeholders or unescaped script tokens', () => {
    const rootHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
    assert.ok(!rootHtml.includes('GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN'));
    assert.ok(!rootHtml.includes('BING_WEBMASTER_VERIFICATION_TOKEN'));

    const menuHtml = fs.readFileSync(path.resolve('public/menu/index.html'), 'utf8');
    assert.ok(menuHtml.includes('escapeHtml('), 'Menu template must include escapeHtml XSS guard');
  });

  it('extracts human-readable errors from Vercel object error payloads without [object Object]', async () => {
    const esbuild = await import('esbuild');
    const bundled = await esbuild.build({
      entryPoints: [path.resolve('src/admin/adminApi.ts')],
      bundle: false,
      write: false,
      format: 'esm',
    });
    const modUrl = `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`;
    const { extractErrorMessage } = await import(modUrl);

    assert.equal(
      extractErrorMessage({ error: { code: 'FUNCTION_INVOCATION_FAILED', message: 'A server error has occurred' } }),
      'A server error has occurred (FUNCTION_INVOCATION_FAILED)'
    );
    assert.equal(extractErrorMessage({ error: 'Invalid email or password.' }), 'Invalid email or password.');
    assert.equal(extractErrorMessage({ message: 'Gateway timeout' }), 'Gateway timeout');
    assert.ok(!extractErrorMessage({ error: { code: 'ERR' } }).includes('[object Object]'));
  });

  it('handles Vercel serverless entrypoint (api/index.js) and same-host proxy login cleanly', async () => {
    const { execFileSync } = await import('node:child_process');
    const vercelTestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amol-vercel-sim-'));
    try {
      const script = `
        import assert from 'node:assert/strict';
        import app, { dbReadyPromise } from './server/index.js';
        import apiApp from './api/index.js';
        assert.equal(apiApp, app);
        await dbReadyPromise;
        const srv = app.listen(0, '127.0.0.1');
        await new Promise((r) => srv.once('listening', r));
        const port = srv.address().port;
        try {
          const loginRes = await fetch('http://127.0.0.1:' + port + '/api/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'amol-preview.vercel.app',
              Origin: 'https://amol-preview.vercel.app',
              'X-Forwarded-Host': 'amol-preview.vercel.app',
              'X-Forwarded-Proto': 'https'
            },
            body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_INITIAL_PASSWORD })
          });
          assert.equal(loginRes.status, 200);
          const body = await loginRes.json();
          assert.equal(body.success, true);
          assert.ok(body.csrfToken);
          assert.equal(loginRes.headers.get('access-control-allow-origin'), 'https://amol-preview.vercel.app');
        } finally {
          srv.close();
          const { closeDb } = await import('./server/db/connection.js');
          await closeDb();
        }
      `;
      execFileSync(process.execPath, ['--input-type=module', '-e', script], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VERCEL: '1',
          NODE_ENV: 'production',
          DATABASE_URL: '',
          SQLITE_DB_PATH: '',
          TEMP: vercelTestDir,
          TMP: vercelTestDir,
          TMPDIR: vercelTestDir,
          ALLOWED_ORIGIN: 'https://amolvegresto.in',
          SITE_URL: 'https://amolvegresto.in',
          ADMIN_EMAIL: 'verceltest@amolvegresto.in',
          ADMIN_INITIAL_PASSWORD: 'VercelTestPassword@2026',
        },
        stdio: 'pipe',
      });
    } finally {
      fs.rmSync(vercelTestDir, { recursive: true, force: true });
    }
  });
});

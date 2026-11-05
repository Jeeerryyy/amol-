import { chromium } from 'playwright';
import fs from 'fs';

async function runAudit() {
  console.log('=== STARTING FAANG/MAANG TECHNICAL SEO BASELINE AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });
  const results = {
    home: {},
    menu: {},
    robotsTxt: false,
    sitemapXml: false,
    llmsTxt: false
  };

  // 1. Audit Home Page
  console.log('--> Auditing Home Page (http://localhost:5173/)...');
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, // Mobile-first (iPhone 12/13/14)
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });

  const startTime = Date.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const loadTimeMs = Date.now() - startTime;

  const homeAudit = await page.evaluate(() => {
    // 1. Meta Tags
    const getMeta = (selector, attr = 'content') => {
      const el = document.querySelector(selector);
      return el ? el.getAttribute(attr) : null;
    };

    const title = document.title;
    const description = getMeta('meta[name="description"]');
    const canonical = getMeta('link[rel="canonical"]', 'href');
    const robots = getMeta('meta[name="robots"]');
    const ogTitle = getMeta('meta[property="og:title"]');
    const ogDesc = getMeta('meta[property="og:description"]');
    const ogImage = getMeta('meta[property="og:image"]');
    const ogType = getMeta('meta[property="og:type"]');
    const twitterCard = getMeta('meta[name="twitter:card"]');
    const geoRegion = getMeta('meta[name="geo.region"]');
    const geoPlacename = getMeta('meta[name="geo.placename"]');
    const geoPosition = getMeta('meta[name="geo.position"]');
    const icbm = getMeta('meta[name="ICBM"]');
    const themeColor = getMeta('meta[name="theme-color"]');
    const lang = document.documentElement.lang;

    // 2. Headings & Hierarchy
    const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim());
    const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim());
    const h3s = Array.from(document.querySelectorAll('h3')).map(el => el.textContent.trim());

    // 3. Structured Data JSON-LD
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try {
        return JSON.parse(s.textContent);
      } catch (e) {
        return { error: 'Invalid JSON-LD', raw: s.textContent };
      }
    });

    // 4. Images Audit
    const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      hasAlt: img.hasAttribute('alt') && img.getAttribute('alt').trim().length > 0,
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      loading: img.getAttribute('loading')
    }));

    // 5. Performance Metrics from Navigation Timing
    const navTiming = performance.getEntriesByType('navigation')[0] || {};
    const ttfb = navTiming.responseStart ? Math.round(navTiming.responseStart - navTiming.requestStart) : null;
    const domContentLoaded = navTiming.domContentLoadedEventEnd ? Math.round(navTiming.domContentLoadedEventEnd) : null;

    return {
      title,
      description,
      canonical,
      robots,
      ogTitle,
      ogDesc,
      ogImage,
      ogType,
      twitterCard,
      geoRegion,
      geoPlacename,
      geoPosition,
      icbm,
      themeColor,
      lang,
      h1s,
      h2Count: h2s.length,
      h3Count: h3s.length,
      jsonLdScripts,
      imagesTotal: imgs.length,
      imagesMissingAlt: imgs.filter(i => !i.hasAlt).length,
      imagesMissingDimensions: imgs.filter(i => !i.width || !i.height).length,
      ttfb,
      domContentLoaded
    };
  });

  results.home = { loadTimeMs, ...homeAudit };

  // 2. Audit Menu Page (/menu/)
  console.log('--> Auditing Digital Menu Page (http://localhost:5173/menu/)...');
  const menuPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });

  const menuStartTime = Date.now();
  await menuPage.goto('http://localhost:5173/menu/', { waitUntil: 'networkidle' });
  const menuLoadTimeMs = Date.now() - menuStartTime;

  const menuAudit = await menuPage.evaluate(() => {
    const getMeta = (selector, attr = 'content') => {
      const el = document.querySelector(selector);
      return el ? el.getAttribute(attr) : null;
    };

    const title = document.title;
    const description = getMeta('meta[name="description"]');
    const canonical = getMeta('link[rel="canonical"]', 'href');
    const robots = getMeta('meta[name="robots"]');
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try { return JSON.parse(s.textContent); } catch (e) { return { error: 'Invalid JSON-LD' }; }
    });
    const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim());
    const dishesRendered = document.querySelectorAll('.menu-dish-card').length;

    return {
      title,
      description,
      canonical,
      robots,
      h1s,
      jsonLdScripts,
      dishesRendered
    };
  });

  results.menu = { loadTimeMs: menuLoadTimeMs, ...menuAudit };

  // 3. Check robots.txt, sitemap.xml, llms.txt
  results.robotsTxt = fs.existsSync('public/robots.txt');
  results.sitemapXml = fs.existsSync('public/sitemap.xml');
  results.llmsTxt = fs.existsSync('public/llms.txt');

  await browser.close();

  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('audit-runtime-results.json', JSON.stringify(results, null, 2));
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});

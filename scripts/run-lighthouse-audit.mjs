import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

async function runAudit() {
  console.log('Launching Playwright Chromium with remote debugging port 9222...');
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222', '--no-sandbox']
  });

  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: 9222,
  };

  const targetUrl = process.argv[2] || 'http://localhost:4173/';
  console.log(`Running Lighthouse audit on ${targetUrl}...`);
  const runnerResult = await lighthouse(targetUrl, options);

  await browser.close();

  const report = runnerResult.lhr;
  console.log('\n================ LIGHTHOUSE BASELINE REPORT ================');
  console.log('Performance:    ', Math.round(report.categories.performance.score * 100));
  console.log('Accessibility:  ', Math.round(report.categories.accessibility.score * 100));
  console.log('Best Practices: ', Math.round(report.categories['best-practices'].score * 100));
  console.log('SEO:            ', Math.round(report.categories.seo.score * 100));
  console.log('------------------------------------------------------------');
  console.log('FCP:            ', report.audits['first-contentful-paint']?.displayValue);
  console.log('LCP:            ', report.audits['largest-contentful-paint']?.displayValue);
  console.log('TBT:            ', report.audits['total-blocking-time']?.displayValue);
  console.log('CLS:            ', report.audits['cumulative-layout-shift']?.displayValue);
  console.log('Speed Index:    ', report.audits['speed-index']?.displayValue);
  for (const k of Object.keys(report.audits)) {
    if (k.includes('lcp') || k.includes('largest')) {
      console.log('LCP Audit Key:', k, '->', JSON.stringify(report.audits[k]?.details?.items || report.audits[k]?.displayValue));
    }
  }
  console.log('============================================================\n');

  console.log('FAILING ACCESSIBILITY AUDITS:');
  for (const [key, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 1 && report.categories.accessibility.auditRefs.some(ref => ref.id === key)) {
      console.log(`- [${key}] ${audit.title} (score: ${audit.score}): ${audit.displayValue || ''}`);
      if (audit.details?.items) {
        for (const item of audit.details.items.slice(0, 5)) {
          console.log(`    selector: ${item.node?.selector || item.node?.snippet || item.selector || JSON.stringify(item)}`);
          if (item.explanation) console.log(`    explanation: ${item.explanation}`);
        }
      }
    }
  }

  console.log('\nFAILING BEST PRACTICES AUDITS:');
  for (const [key, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 1 && report.categories['best-practices'].auditRefs.some(ref => ref.id === key)) {
      console.log(`- [${key}] ${audit.title}: ${audit.displayValue || ''}`);
      if (audit.details?.items) {
        for (const item of audit.details.items.slice(0, 5)) {
          console.log(`    item: ${JSON.stringify(item)}`);
        }
      }
    }
  }

  console.log('\nFAILING SEO AUDITS:');
  for (const [key, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 1 && report.categories.seo.auditRefs.some(ref => ref.id === key)) {
      console.log(`- [${key}] ${audit.title}: ${audit.displayValue || ''}`);
      if (audit.details?.items) {
        for (const item of audit.details.items.slice(0, 5)) {
          console.log(`    item: ${JSON.stringify(item)}`);
        }
      }
    }
  }

  console.log('\nMAIN THREAD BREAKDOWN:');
  const mainThread = report.audits['mainthread-work-breakdown'];
  if (mainThread?.details?.items) {
    for (const item of mainThread.details.items) {
      console.log(`- ${item.groupLabel || item.group}: ${item.duration?.toFixed(0)} ms`);
    }
  }

  console.log('\nLONG TASKS:');
  const longTasks = report.audits['long-tasks'];
  if (longTasks?.details?.items) {
    for (const item of longTasks.details.items.slice(0, 5)) {
      console.log(`- duration: ${item.duration?.toFixed(0)} ms, start: ${item.startTime?.toFixed(0)} ms, url: ${item.url || 'inline'}`);
    }
  }

  console.log('\nRENDER BLOCKING INSIGHT:');
  const rb = report.audits['render-blocking-insight'];
  if (rb?.details?.items) {
    for (const item of rb.details.items) {
      console.log(`- ${item.url}: savings ${item.wastedMs} ms`);
    }
  }

  console.log('\nIMAGE DELIVERY INSIGHT:');
  const imgDeliv = report.audits['image-delivery-insight'] || report.audits['modern-image-formats'];
  if (imgDeliv?.details?.items) {
    for (const item of imgDeliv.details.items) {
      console.log(`- ${item.url}: savings ${item.wastedBytes} bytes`);
    }
  }

  console.log('\nFAILING PERFORMANCE AUDITS:');
  for (const [key, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 1 && report.categories.performance.auditRefs.some(ref => ref.id === key)) {
      console.log(`- [${key}] ${audit.title}: ${audit.displayValue || ''}`);
      if (key === 'largest-contentful-paint-element') {
        console.log(`    LCP element:`, audit.details?.items?.[0]?.node?.snippet || audit.details?.items);
      }
    }
  }
}

runAudit().catch(err => {
  console.error('Lighthouse run failed:', err);
  process.exit(1);
});

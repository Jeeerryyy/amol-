import fs from 'fs';
import path from 'path';

console.log('=== RUNNING FAANG/MAANG SCHEMA.ORG & RICH RESULTS VALIDATOR ===\n');

let errorCount = 0;
let warningCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [ERROR] ${message}`);
    errorCount++;
  }
}

function warn(condition, message) {
  if (!condition) {
    console.warn(`⚠️ [WARN] ${message}`);
    warningCount++;
  }
}

function validateSchema(schema, source) {
  console.log(`Checking schema from: ${source}`);
  assert(schema['@context'] === 'https://schema.org' || schema['@context'] === 'http://schema.org', 'Missing valid @context');

  const items = schema['@graph'] ? schema['@graph'] : [schema];

  for (const item of items) {
    const type = item['@type'];
    assert(!!type, `Entity missing @type: ${JSON.stringify(item).slice(0, 50)}`);

    if (type === 'Restaurant' || type === 'FoodEstablishment' || type === 'LocalBusiness') {
      console.log(`  ✓ Validating ${type}: "${item.name}"`);
      assert(!!item.name, 'Restaurant missing name');
      assert(!!item.url, 'Restaurant missing url');
      assert(!!item.telephone, 'Restaurant missing telephone');
      assert(!!item.address, 'Restaurant missing address');
      if (item.address) {
        assert(!!item.address.streetAddress, 'PostalAddress missing streetAddress');
        assert(!!item.address.addressLocality, 'PostalAddress missing addressLocality');
        assert(!!item.address.addressRegion, 'PostalAddress missing addressRegion');
        assert(!!item.address.postalCode, 'PostalAddress missing postalCode');
        assert(item.address.addressCountry === 'IN', 'PostalAddress country should be IN');
      }
      assert(!!item.geo, 'Restaurant missing geo coordinates');
      if (item.geo) {
        assert(typeof item.geo.latitude === 'number', 'Geo latitude must be a number');
        assert(typeof item.geo.longitude === 'number', 'Geo longitude must be a number');
      }
      assert(Array.isArray(item.servesCuisine) && item.servesCuisine.length > 0, 'servesCuisine must be a non-empty array');
      assert(!!item.priceRange, 'priceRange must be defined');
    }

    if (type === 'Menu') {
      console.log(`  ✓ Validating Menu: "${item.name}"`);
      assert(!!item.name, 'Menu missing name');
      assert(!!item.url, 'Menu missing url');
      assert(Array.isArray(item.hasMenuSection) && item.hasMenuSection.length > 0, 'hasMenuSection must be a non-empty array');
      let totalDishes = 0;
      item.hasMenuSection.forEach(section => {
        assert(!!section.name, 'MenuSection missing name');
        assert(Array.isArray(section.hasMenuItem), `MenuSection "${section.name}" missing hasMenuItem array`);
        totalDishes += section.hasMenuItem.length;
        section.hasMenuItem.forEach(dish => {
          assert(!!dish.name, `MenuItem missing name in section ${section.name}`);
          assert(!!dish.offers, `MenuItem "${dish.name}" missing offers`);
          if (dish.offers) {
            assert(!!dish.offers.price, `MenuItem "${dish.name}" missing offer price`);
            assert(dish.offers.priceCurrency === 'INR', `MenuItem "${dish.name}" currency should be INR`);
          }
          assert(dish.suitableForDiet === 'https://schema.org/VegetarianDiet', `MenuItem "${dish.name}" must be marked VegetarianDiet`);
        });
      });
      console.log(`    -> Verified ${item.hasMenuSection.length} MenuSections containing ${totalDishes} MenuItems.`);
    }

    if (type === 'FAQPage') {
      console.log(`  ✓ Validating FAQPage`);
      assert(Array.isArray(item.mainEntity) && item.mainEntity.length > 0, 'FAQPage mainEntity must be an array of questions');
      item.mainEntity.forEach((q, idx) => {
        assert(q['@type'] === 'Question', `Item #${idx} in FAQPage must be @type Question`);
        assert(!!q.name, `Question #${idx} missing question name/text`);
        assert(q.acceptedAnswer && q.acceptedAnswer['@type'] === 'Answer', `Question "${q.name}" missing acceptedAnswer of @type Answer`);
        assert(q.acceptedAnswer && !!q.acceptedAnswer.text, `Question "${q.name}" answer missing text`);
      });
      console.log(`    -> Verified ${item.mainEntity.length} FAQ questions & answers.`);
    }

    if (type === 'BreadcrumbList') {
      console.log(`  ✓ Validating BreadcrumbList`);
      assert(Array.isArray(item.itemListElement) && item.itemListElement.length > 0, 'BreadcrumbList itemListElement missing');
      item.itemListElement.forEach(crumb => {
        assert(crumb['@type'] === 'ListItem', 'Breadcrumb item must be ListItem');
        assert(typeof crumb.position === 'number', 'Breadcrumb position must be number');
        assert(!!crumb.name, 'Breadcrumb missing name');
        assert(!!crumb.item, 'Breadcrumb missing item URL');
      });
    }
  }
}

// 1. Validate index.html schemas
const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
const indexMatches = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert(indexMatches.length > 0, 'index.html has zero JSON-LD scripts');
indexMatches.forEach((match, idx) => {
  try {
    const json = JSON.parse(match[1]);
    validateSchema(json, `index.html script #${idx + 1}`);
  } catch (e) {
    assert(false, `index.html script #${idx + 1} has invalid JSON syntax: ${e.message}`);
  }
});

// 2. Validate public/menu/index.html schemas
const menuHtml = fs.readFileSync(path.resolve('public/menu/index.html'), 'utf8');
const menuMatches = [...menuHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert(menuMatches.length > 0, 'public/menu/index.html has zero JSON-LD scripts');
menuMatches.forEach((match, idx) => {
  try {
    const json = JSON.parse(match[1]);
    validateSchema(json, `public/menu/index.html script #${idx + 1}`);
  } catch (e) {
    assert(false, `public/menu/index.html script #${idx + 1} has invalid JSON syntax: ${e.message}`);
  }
});

console.log('\n----------------------------------------');
if (errorCount === 0) {
  console.log(`✅ ALL SCHEMAS VALIDATED PERFECTLY! Zero errors found (${warningCount} warnings).`);
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${errorCount} SCHEMA ERRORS.`);
  process.exit(1);
}

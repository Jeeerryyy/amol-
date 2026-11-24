import fs from 'fs';
import path from 'path';

function cleanSvg(filePath, size = '22') {
  let content = fs.readFileSync(filePath, 'utf8').trim();
  // Ensure width and height are uniform
  content = content.replace(/width="[^"]*"/, `width="${size}"`);
  content = content.replace(/height="[^"]*"/, `height="${size}"`);
  if (!content.includes('width=')) {
    content = content.replace('<svg', `<svg width="${size}" height="${size}"`);
  }
  if (!content.includes('aria-hidden=')) {
    content = content.replace('<svg', '<svg aria-hidden="true"');
  }
  return content;
}

// 1. Food category SVGs
const catIconsDir = 'public/icons/10-food-categories';
const categoryIcons = {
  all: cleanSvg(path.join(catIconsDir, 'all-dishes.svg')),
  soups: cleanSvg(path.join(catIconsDir, 'soups.svg')),
  'paneer starters': cleanSvg(path.join(catIconsDir, 'paneer-starters.svg')),
  'chinese starters': cleanSvg(path.join(catIconsDir, 'chinese-starters.svg')),
  tandoori: cleanSvg(path.join(catIconsDir, 'tandoori.svg')),
  starters: cleanSvg(path.join(catIconsDir, 'starters.svg')),
  'main course': cleanSvg(path.join(catIconsDir, 'main-course.svg')),
  'paneer main course': cleanSvg(path.join(catIconsDir, 'paneer-main-course.svg')),
  'kaju special': cleanSvg(path.join(catIconsDir, 'kaju-special.svg')),
  'kofta dishes': cleanSvg(path.join(catIconsDir, 'kofta-dishes.svg')),
  'shev bhaji': cleanSvg(path.join(catIconsDir, 'shev-bhaji-special.svg')),
  'punjabi dishes': cleanSvg(path.join(catIconsDir, 'punjabi-dishes.svg')),
  'dal rice': cleanSvg(path.join(catIconsDir, 'dal-rice.svg')),
  biryani: cleanSvg(path.join(catIconsDir, 'biryani-pulao.svg')),
  roti: cleanSvg(path.join(catIconsDir, 'roti-naan-paratha.svg')),
  'south indian': cleanSvg(path.join(catIconsDir, 'south-indian.svg')),
  'fast food': cleanSvg(path.join(catIconsDir, 'fast-food-snacks.svg')),
  beverages: cleanSvg(path.join(catIconsDir, 'beverages-cold-drinks.svg')),
  'cold coffee': cleanSvg(path.join(catIconsDir, 'cold-coffee-shakes.svg')),
  desserts: cleanSvg(path.join(catIconsDir, 'desserts-ice-cream.svg')),
  salad: cleanSvg(path.join(catIconsDir, 'papad-raita-salad.svg')),
  thali: cleanSvg(path.join(catIconsDir, 'thali-combos.svg')),
  'hot beverages': cleanSvg(path.join(catIconsDir, 'hot-beverages.svg')),
  special: cleanSvg(path.join(catIconsDir, 'special-offers.svg'))
};

// Generate getCategoryIcon code block
function buildGetCategoryIcon() {
  return `function getCategoryIcon(catName) {
      const name = (catName || '').toLowerCase();
      if (name === 'all') return \`${categoryIcons.all}\`;
      if (name.includes('soup')) return \`${categoryIcons.soups}\`;
      if (name.includes('paneer') && (name.includes('starter') || name.includes('tikka'))) return \`${categoryIcons['paneer starters']}\`;
      if (name.includes('chinese') || name.includes('noodle') || name.includes('manchurian')) return \`${categoryIcons['chinese starters']}\`;
      if (name.includes('tandoori') && name.includes('starter')) return \`${categoryIcons.tandoori}\`;
      if (name.includes('starter') || name.includes('crispy') || name.includes('snack')) return \`${categoryIcons.starters}\`;
      if (name.includes('paneer') && (name.includes('main') || name.includes('masala') || name.includes('handi') || name.includes('kadai'))) return \`${categoryIcons['paneer main course']}\`;
      if (name.includes('kaju')) return \`${categoryIcons['kaju special']}\`;
      if (name.includes('kofta')) return \`${categoryIcons['kofta dishes']}\`;
      if (name.includes('shev') || name.includes('sev')) return \`${categoryIcons['shev bhaji']}\`;
      if (name.includes('punjabi')) return \`${categoryIcons['punjabi dishes']}\`;
      if (name.includes('biryani') || name.includes('pulao')) return \`${categoryIcons.biryani}\`;
      if (name.includes('rice') || name.includes('dal')) return \`${categoryIcons['dal rice']}\`;
      if (name.includes('roti') || name.includes('naan') || name.includes('paratha') || name.includes('kulcha')) return \`${categoryIcons.roti}\`;
      if (name.includes('south') || name.includes('dosa') || name.includes('idli') || name.includes('uttapam')) return \`${categoryIcons['south indian']}\`;
      if (name.includes('sandwich') || name.includes('burger') || name.includes('pizza') || name.includes('fries')) return \`${categoryIcons['fast food']}\`;
      if (name.includes('coffee') || name.includes('shake')) return \`${categoryIcons['cold coffee']}\`;
      if (name.includes('tea') || name.includes('chai') || name.includes('hot beverage')) return \`${categoryIcons['hot beverages']}\`;
      if (name.includes('drink') || name.includes('beverage') || name.includes('soda')) return \`${categoryIcons.beverages}\`;
      if (name.includes('brownie') || name.includes('ice cream') || name.includes('dessert') || name.includes('sweet')) return \`${categoryIcons.desserts}\`;
      if (name.includes('raita') || name.includes('salad') || name.includes('papad')) return \`${categoryIcons.salad}\`;
      if (name.includes('thali') || name.includes('combo')) return \`${categoryIcons.thali}\`;
      if (name.includes('main')) return \`${categoryIcons['main course']}\`;
      return \`${categoryIcons.special}\`;
    }`;
}

// 2. Action buttons SVGs
const actionIconsDir = 'public/icons/05-menu-action-buttons';
const actionIcons = {
  whatsapp: cleanSvg(path.join(actionIconsDir, 'whatsapp.svg'), '18'),
  call_waiter: cleanSvg(path.join(actionIconsDir, 'call-waiter-service-bell.svg'), '18'),
  zomato: cleanSvg(path.join(actionIconsDir, 'zomato.svg'), '18'),
  swiggy: cleanSvg(path.join(actionIconsDir, 'swiggy.svg'), '18'),
  custom: cleanSvg(path.join(actionIconsDir, 'custom-action.svg'), '18')
};

function buildGetButtonIconSvg() {
  return `function getButtonIconSvg(type) {
      if (type === 'whatsapp') {
        return \`${actionIcons.whatsapp.replace('<svg', '<svg class="btn-icon-svg"')}\`;
      }
      if (type === 'call_waiter') {
        return \`${actionIcons.call_waiter.replace('<svg', '<svg class="btn-icon-svg"')}\`;
      }
      if (type === 'zomato') {
        return \`${actionIcons.zomato.replace('<svg', '<svg class="btn-icon-svg"')}\`;
      }
      if (type === 'swiggy') {
        return \`${actionIcons.swiggy.replace('<svg', '<svg class="btn-icon-svg"')}\`;
      }
      return \`${actionIcons.custom.replace('<svg', '<svg class="btn-icon-svg"')}\`;
    }`;
}

// 3. Badges & Controls
const badgesDir = 'public/icons/04-menu-food-badges';
const leafSvg = cleanSvg(path.join(badgesDir, 'pure-veg-leaf.svg'), '22').replace('<svg', '<svg stroke="#2E7D32"');
const chiliSvg = cleanSvg(path.join(badgesDir, 'spice-level-chili-pepper.svg'), '22').replace('<svg', '<svg fill="#D32F2F"');
const freshSvg = cleanSvg(path.join(badgesDir, 'fresh-made-chef-hat-cutlery.svg'), '22').replace('<svg', '<svg stroke="#B85D19"');
const searchGlassSvg = cleanSvg(path.join(badgesDir, 'search-magnifying-glass.svg'), '18');
const searchClearSvg = cleanSvg(path.join(badgesDir, 'search-clear-x-circle.svg'), '14');
const modalCloseSvg = cleanSvg(path.join(badgesDir, 'modal-close-x-mark.svg'), '18');

// Update public/menu/index.template.html
let template = fs.readFileSync('public/menu/index.template.html', 'utf8');

// Replace getButtonIconSvg
const btnStart = template.indexOf('function getButtonIconSvg(type) {');
const btnEnd = template.indexOf('function getCategoryIcon(catName) {', btnStart);
if (btnStart !== -1 && btnEnd !== -1) {
  template = template.slice(0, btnStart) + buildGetButtonIconSvg() + '\n\n    ' + template.slice(btnEnd);
  console.log('Replaced getButtonIconSvg in index.template.html');
}

// Replace getCategoryIcon
const catStart = template.indexOf('function getCategoryIcon(catName) {');
const catEnd = template.indexOf('function renderCategoryTabs()', catStart);
if (catStart !== -1 && catEnd !== -1) {
  template = template.slice(0, catStart) + buildGetCategoryIcon() + '\n\n    ' + template.slice(catEnd);
  console.log('Replaced getCategoryIcon in index.template.html');
}

// Replace modal attributes
const attrBlock = `<div class="modal-attributes-row">
            <div class="modal-attr-item">
              <span class="attr-icon-circle">
                ${leafSvg}
              </span>
              <span class="attr-label">100% Pure Veg</span>
            </div>
            <div class="modal-attr-item">
              <span class="attr-icon-circle">
                ${chiliSvg}
              </span>
              <span class="attr-label" id="modalSpiceLevel">Medium Spicy</span>
            </div>
            <div class="modal-attr-item">
              <span class="attr-icon-circle">
                ${freshSvg}
              </span>
              <span class="attr-label">Fresh Made</span>
            </div>
          </div>`;

template = template.replace(/<div class="modal-attributes-row">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, attrBlock);
console.log('Replaced modal attributes in index.template.html');

// Update search icons and modal close button
template = template.replace(/<svg class="search-icon"[\s\S]*?<\/svg>/, '<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21l-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>');

template = template.replace(/<button type="button" id="searchClearBtn"[\s\S]*?<\/button>/, '<button type="button" id="searchClearBtn" class="search-clear-btn" onclick="clearSearch()" style="display: none;" aria-label="Clear search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9l-6 6m0-6l6 6"/></svg></button>');

template = template.replace(/<button type="button" class="modal-close-btn" onclick="closeModal\(\)" aria-label="Close modal">[\s\S]*?<\/button>/, '<button type="button" class="modal-close-btn" onclick="closeModal()" aria-label="Close modal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button>');

fs.writeFileSync('public/menu/index.template.html', template, 'utf8');

// Update scripts/prerender-menu.mjs
let prerenderScript = fs.readFileSync('scripts/prerender-menu.mjs', 'utf8');
const pCatStart = prerenderScript.indexOf('function getCategoryIcon(catName) {');
const pCatEnd = prerenderScript.indexOf('// Dish Card Markup Generator', pCatStart);
if (pCatStart !== -1 && pCatEnd !== -1) {
  prerenderScript = prerenderScript.slice(0, pCatStart) + buildGetCategoryIcon() + '\n\n' + prerenderScript.slice(pCatEnd);
  fs.writeFileSync('scripts/prerender-menu.mjs', prerenderScript, 'utf8');
  console.log('Replaced getCategoryIcon in scripts/prerender-menu.mjs');
}

console.log('Updated template and prerender scripts successfully!');

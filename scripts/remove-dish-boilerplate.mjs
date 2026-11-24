import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/restaurant.db');
const db = new DatabaseSync(dbPath);

console.log('[1/4] Inspecting SQLite database at:', dbPath);

const boilerplateRegex = /^Authentic pure vegetarian\s+.*?\s+prepared fresh with traditional spices\.?$/i;

const allDishes = db.prepare('SELECT id, name, description FROM dishes').all();
console.log(`Total dishes in database: ${allDishes.length}`);

let updatedDbCount = 0;
const updateStmt = db.prepare('UPDATE dishes SET description = ? WHERE id = ?');

for (const dish of allDishes) {
  if (dish.description && boilerplateRegex.test(dish.description.trim())) {
    updateStmt.run('', dish.id);
    updatedDbCount++;
  }
}

console.log(`[SQLite] Removed boilerplate description from ${updatedDbCount} dishes.`);

// Check remaining descriptions
const remaining = db.prepare("SELECT id, name, description FROM dishes WHERE description IS NOT NULL AND description != ''").all();
console.log(`Dishes with custom/non-boilerplate description remaining in DB: ${remaining.length}`);
if (remaining.length > 0) {
  console.log('Sample remaining:', remaining.slice(0, 3));
}

// 2. Update public/menu/restaurant_menu_data.json
const menuJsonPath = path.resolve(__dirname, '../public/menu/restaurant_menu_data.json');
if (fs.existsSync(menuJsonPath)) {
  const menuData = JSON.parse(fs.readFileSync(menuJsonPath, 'utf8'));
  let jsonCleared = 0;
  if (Array.isArray(menuData.dishes)) {
    for (const d of menuData.dishes) {
      if (d.description && boilerplateRegex.test(d.description.trim())) {
        d.description = '';
        jsonCleared++;
      }
    }
  }
  fs.writeFileSync(menuJsonPath, JSON.stringify(menuData, null, 2), 'utf8');
  console.log(`[2/4] Cleaned ${jsonCleared} dish descriptions in ${menuJsonPath}`);
}

// 3. Update scripts/category-dish-breakdown.json if present
const breakdownPath = path.resolve(__dirname, 'category-dish-breakdown.json');
if (fs.existsSync(breakdownPath)) {
  const breakdownData = JSON.parse(fs.readFileSync(breakdownPath, 'utf8'));
  let breakdownCleared = 0;
  for (const catKey of Object.keys(breakdownData)) {
    const list = breakdownData[catKey];
    if (Array.isArray(list)) {
      for (const d of list) {
        if (d.description && boilerplateRegex.test(d.description.trim())) {
          d.description = '';
          breakdownCleared++;
        }
      }
    }
  }
  fs.writeFileSync(breakdownPath, JSON.stringify(breakdownData, null, 2), 'utf8');
  console.log(`[3/4] Cleaned ${breakdownCleared} dish descriptions in ${breakdownPath}`);
}

// 4. Update scripts/seed-complete-menu.js to avoid re-generating boilerplate
const seedScriptPath = path.resolve(__dirname, 'seed-complete-menu.js');
if (fs.existsSync(seedScriptPath)) {
  let seedCode = fs.readFileSync(seedScriptPath, 'utf8');
  const targetStr = "description: `Authentic pure vegetarian ${d.name} prepared fresh with traditional spices.`,";
  if (seedCode.includes(targetStr)) {
    seedCode = seedCode.replace(targetStr, "description: '',");
    fs.writeFileSync(seedScriptPath, seedCode, 'utf8');
    console.log(`[4/4] Updated ${seedScriptPath} so description defaults to empty string.`);
  }
}

console.log('[Done] All dish boilerplate descriptions successfully removed.');

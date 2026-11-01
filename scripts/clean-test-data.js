import { query } from '../server/db.js';

async function clean() {
  await query('DELETE FROM dishes WHERE name = $1', ['Negative Price Dish']);
  console.log('Cleaned test dishes.');
}

clean().catch(console.error);

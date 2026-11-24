import { query } from '../server/db/connection.js';

async function update() {
  await query("UPDATE menu_buttons SET bg_color = '#FAF4EC', hover_color = '#EADECF' WHERE id = 'btn_waiter'");
  const rows = await query('SELECT id, type, label, bg_color, hover_color, is_enabled FROM menu_buttons ORDER BY sort_order ASC');
  console.log('Updated menu_buttons:', rows);
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});

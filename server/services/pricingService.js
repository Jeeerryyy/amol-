import { query, isPostgres } from '../db/connection.js';

/**
 * Calculate special price from base price and global settings
 */
export function calculateSpecialPrice(basePrice, markupPercent = 10, roundingStep = 1) {
  if (basePrice === null || basePrice === undefined || isNaN(basePrice)) {
    return 0;
  }
  const rawPrice = Number(basePrice) * (1 + Number(markupPercent) / 100);
  const step = Number(roundingStep) || 1;
  return Math.round(rawPrice / step) * step;
}

/**
 * Fetch current pricing settings from database
 */
export async function getPricingSettings() {
  const settingsRows = await query(
    "SELECT key, value FROM settings WHERE key IN ('special_markup_percent', 'rounding_step')"
  );
  let markup = 10;
  let rounding = 1;

  for (const row of settingsRows) {
    const numVal = Number(row.value);
    if (row.key === 'special_markup_percent' && !Number.isNaN(numVal)) markup = numVal;
    if (row.key === 'rounding_step' && !Number.isNaN(numVal) && numVal > 0) rounding = numVal;
  }

  return { markup, rounding };
}

/**
 * Recalculate all non-overridden dishes and variants belonging to scope = 'both'.
 * Preserves dedicated special_only dishes and explicit per-item overrides.
 */
export async function recalculateAllNonOverriddenPrices() {
  const { markup, rounding } = await getPricingSettings();
  const now = new Date().toISOString();

  if (isPostgres) {
    await query(
      `UPDATE dishes
       SET special_price = ROUND((base_price * (1 + $1::numeric / 100)) / $2::numeric) * $2::numeric,
           updated_at = $3
       WHERE scope = 'both' AND special_price_override IS NULL AND price_type = 'single' AND deleted_at IS NULL`,
      [markup, rounding, now]
    );

    await query(
      `UPDATE dish_variants
       SET special_price = ROUND((base_price * (1 + $1::numeric / 100)) / $2::numeric) * $2::numeric
       WHERE special_price_override IS NULL
         AND dish_id IN (SELECT id FROM dishes WHERE scope = 'both' AND deleted_at IS NULL)`,
      [markup, rounding]
    );
  } else {
    await query(
      `UPDATE dishes
       SET special_price = ROUND((base_price * (1 + (? / 100.0))) / ?) * ?,
           updated_at = ?
       WHERE scope = 'both' AND special_price_override IS NULL AND price_type = 'single' AND deleted_at IS NULL`,
      [markup, rounding, rounding, now]
    );

    await query(
      `UPDATE dish_variants
       SET special_price = ROUND((base_price * (1 + (? / 100.0))) / ?) * ?
       WHERE special_price_override IS NULL
         AND dish_id IN (SELECT id FROM dishes WHERE scope = 'both' AND deleted_at IS NULL)`,
      [markup, rounding, rounding]
    );
  }

  const [countDishes] = await query(
    "SELECT COUNT(*) as count FROM dishes WHERE scope = 'both' AND special_price_override IS NULL AND price_type = 'single' AND deleted_at IS NULL"
  );
  const [countVariants] = await query(
    "SELECT COUNT(*) as count FROM dish_variants WHERE special_price_override IS NULL AND dish_id IN (SELECT id FROM dishes WHERE scope = 'both' AND deleted_at IS NULL)"
  );

  return {
    updatedDishes: Number(countDishes?.count || 0),
    updatedVariants: Number(countVariants?.count || 0),
    markup,
    rounding,
  };
}

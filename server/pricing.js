import { query } from './db.js';

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
    if (row.key === 'special_markup_percent') markup = Number(row.value) || 10;
    if (row.key === 'rounding_step') rounding = Number(row.value) || 1;
  }

  return { markup, rounding };
}

/**
 * Recalculate all non-overridden dishes and variants
 * Called when owner changes global markup % or rounding step in Settings > Pricing
 */
export async function recalculateAllNonOverriddenPrices() {
  const { markup, rounding } = await getPricingSettings();
  const now = new Date().toISOString();

  // 1. Recalculate single-price dishes with scope 'both' that don't have special_price_override
  const dishes = await query(
    "SELECT id, base_price FROM dishes WHERE scope = 'both' AND special_price_override IS NULL AND price_type = 'single'"
  );

  for (const dish of dishes) {
    const newSpecial = calculateSpecialPrice(dish.base_price, markup, rounding);
    await query('UPDATE dishes SET special_price = $1, updated_at = $2 WHERE id = $3', [
      newSpecial,
      now,
      dish.id,
    ]);
  }

  // 2. Recalculate variants where special_price_override IS NULL
  const variants = await query(
    'SELECT id, base_price FROM dish_variants WHERE special_price_override IS NULL'
  );

  for (const variant of variants) {
    const newSpecial = calculateSpecialPrice(variant.base_price, markup, rounding);
    await query('UPDATE dish_variants SET special_price = $1 WHERE id = $2', [
      newSpecial,
      variant.id,
    ]);
  }

  return { updatedDishes: dishes.length, updatedVariants: variants.length, markup, rounding };
}

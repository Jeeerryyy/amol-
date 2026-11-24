import fs from 'fs';
import { query } from '../server/db/connection.js';

// 1. Revert template CSS and Zomato icon
const templatePath = 'public/menu/index.template.html';
let template = fs.readFileSync(templatePath, 'utf8');

// Replace .modal-actions-row CSS
template = template.replace(
  /\.modal-actions-row\s*\{[\s\S]*?\.modal-actions-row:empty/,
  `.modal-actions-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 14px;
      width: 100%;
    }

    .modal-actions-row:empty`
);

// Replace .uiverse-menu-btn CSS
template = template.replace(
  /\.uiverse-menu-btn\s*\{[\s\S]*?\.uiverse-menu-btn:hover/,
  `.uiverse-menu-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 44px;
      padding: 10px 24px;
      overflow: hidden;
      letter-spacing: -0.02em;
      color: #FFFFFF !important;
      background-color: var(--btn-base-bg, #1F2937);
      border-radius: 8px; /* Uiverse.io Mubashir222 rounded-md */
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      text-decoration: none;
      font-family: var(--font-sans);
      font-size: 13.5px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      user-select: none;
      box-sizing: border-box;
      text-align: center;
    }

    .uiverse-menu-btn:hover`
);

// Replace .btn-inner-gloss
template = template.replace(
  /\.uiverse-menu-btn \.btn-inner-gloss\s*\{[\s\S]*?\}\s*\.uiverse-menu-btn \.btn-content-label/,
  `.uiverse-menu-btn .btn-inner-gloss {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin-top: -4px;
      border-radius: 8px; /* Uiverse.io Mubashir222 rounded-md */
      opacity: 0.28;
      background: linear-gradient(to bottom, transparent, transparent, rgba(229, 231, 235, 0.35));
      pointer-events: none;
      z-index: 1;
    }

    .uiverse-menu-btn .btn-content-label`
);

// Replace .btn-content-label to prevent any truncation
template = template.replace(
  /\.uiverse-menu-btn \.btn-content-label\s*\{[\s\S]*?\}\s*\.uiverse-menu-btn \.btn-icon-svg/,
  `.uiverse-menu-btn .btn-content-label {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
    }

    .uiverse-menu-btn .btn-icon-svg`
);

// Replace Zomato icon with clean cutlery SVG (so it doesn't display "ato")
const oldZomatoIconRegex = /if \(type === 'zomato'\) \{[\s\S]*?return `<svg class="btn-icon-svg"[\s\S]*?<\/svg>`;\s*\}/;
template = template.replace(
  oldZomatoIconRegex,
  `if (type === 'zomato') {
        return \`<svg class="btn-icon-svg" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v19"/><path d="M5 2v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2"/><path d="M8 10v11"/></svg>\`;
      }`
);

fs.writeFileSync(templatePath, template, 'utf8');
console.log('✅ Updated public/menu/index.template.html with rounded-md and full-width layout');

// 2. Revert AdminMenus preview to borderRadius: '8px'
const adminPath = 'src/admin/AdminMenus.tsx';
let adminContent = fs.readFileSync(adminPath, 'utf8');
adminContent = adminContent.replace(/borderRadius:\s*'9999px'/g, "borderRadius: '8px'");
fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log('✅ Updated src/admin/AdminMenus.tsx preview borderRadius to 8px');

// 3. Reset btn_waiter in database back to deep espresso #2B170B
await query("UPDATE menu_buttons SET bg_color = '#2B170B', hover_color = '#C04A0C' WHERE id = 'btn_waiter'");
const buttons = await query('SELECT id, type, label, bg_color, hover_color, is_enabled FROM menu_buttons ORDER BY sort_order ASC');
console.log('✅ Database buttons:', buttons);

process.exit(0);

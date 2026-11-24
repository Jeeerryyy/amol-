import fs from 'fs';

const filePath = 'public/menu/index.template.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Restore modalActionsRow and closing tags in dish detail modal
const searchTarget = `<div class="modal-attr-item">
              <span class="attr-icon-circle">
                <svg stroke="#B85D19" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v5m4-5v5m-8-3.35c0-.457-.316-.844-.727-1.041A4 4 0 0 1 7.52 4.034a1.53 1.53 0 0 0 1.367-.547a4 4 0 0 1 6.225 0a1.53 1.53 0 0 0 1.367.547a4 4 0 0 1 2.248 7.575c-.411.197-.727.584-.727 1.04V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 16h12"/></svg>
              </span>
              <span class="attr-label">Fresh Made</span>
            </div>
          </div>

  <!-- TOAST -->`;

const restoredMarkup = `<div class="modal-attr-item">
              <span class="attr-icon-circle">
                <svg stroke="#B85D19" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v5m4-5v5m-8-3.35c0-.457-.316-.844-.727-1.041A4 4 0 0 1 7.52 4.034a1.53 1.53 0 0 0 1.367-.547a4 4 0 0 1 6.225 0a1.53 1.53 0 0 0 1.367.547a4 4 0 0 1 2.248 7.575c-.411.197-.727.584-.727 1.04V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 16h12"/></svg>
              </span>
              <span class="attr-label">Fresh Made</span>
            </div>
          </div>
          <div class="modal-divider"></div>
          <div class="modal-actions-row" id="modalActionsRow">
            <!-- Dynamically populated customizable action buttons (WhatsApp, Call Waiter, Zomato, Swiggy, Custom) -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- TOAST -->`;

if (content.includes(searchTarget)) {
  content = content.replace(searchTarget, restoredMarkup);
  console.log('✅ Successfully restored modalActionsRow and closing tags in dish modal');
} else {
  console.warn('⚠️ Could not find exact searchTarget for modal restoration, trying regex fallback');
  content = content.replace(
    /(<span class="attr-label">Fresh Made<\/span>\s*<\/div>\s*<\/div>)\s*(<!-- TOAST -->)/,
    `$1\n          <div class="modal-divider"></div>\n          <div class="modal-actions-row" id="modalActionsRow">\n            <!-- Dynamically populated customizable action buttons (WhatsApp, Call Waiter, Zomato, Swiggy, Custom) -->\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  $2`
  );
}

// 2. Update CSS for .uiverse-menu-btn to be rounded-pill shape (border-radius: var(--radius-pill, 9999px))
content = content.replace(
  /\.uiverse-menu-btn\s*\{([^}]+)\}/,
  (match, p1) => {
    let updated = p1.replace(/border-radius:\s*8px;/, 'border-radius: var(--radius-pill, 9999px);');
    updated = updated.replace(/padding:\s*10px\s+16px;/, 'padding: 11px 22px;');
    updated = updated.replace(/min-height:\s*44px;/, 'min-height: 46px;');
    updated = updated.replace(/font-size:\s*13\.5px;/, 'font-size: 14px;');
    updated = updated.replace(/font-weight:\s*600;/, 'font-weight: 700;');
    return `.uiverse-menu-btn {${updated}}`;
  }
);

content = content.replace(
  /\.uiverse-menu-btn \.btn-inner-gloss\s*\{([^}]+)\}/,
  (match, p1) => {
    let updated = p1.replace(/border-radius:\s*8px;/, 'border-radius: var(--radius-pill, 9999px);');
    return `.uiverse-menu-btn .btn-inner-gloss {${updated}}`;
  }
);

// 3. Enhance renderModalActionButtons to support light vs dark button backgrounds
const renderOldSnippet = `        const bg = b.bg_color || '#1F2937';
        const hoverBg = b.hover_color || '#EA580C';
        const iconSvg = getButtonIconSvg(b.type);
        let href = '#';
        let target = '';
        let onclick = '';
        let label = b.label || '';
        let disabledCss = '';
        let idAttr = '';`;

const renderNewSnippet = `        const bg = b.bg_color || '#1F2937';
        const hoverBg = b.hover_color || '#EA580C';
        const iconSvg = getButtonIconSvg(b.type);
        let href = '#';
        let target = '';
        let onclick = '';
        let label = b.label || '';
        let disabledCss = '';
        let idAttr = '';

        // Dynamic luminance check to support both dark pills (white text) and light/cream pills (dark text + subtle border)
        let isLight = false;
        try {
          let c = (bg || '').replace('#', '').trim();
          if (c.length === 3) c = c.split('').map(x => x + x).join('');
          if (c.length === 6) {
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const bVal = parseInt(c.substring(4, 6), 16);
            const luma = 0.299 * r + 0.587 * g + 0.114 * bVal;
            isLight = luma > 185;
          }
        } catch (_) {}

        const textColor = isLight ? '#2B170B' : '#FFFFFF';
        const borderStyle = isLight ? 'border: 1px solid #D5C2AF;' : 'border: 1px solid transparent;'`;

if (content.includes(renderOldSnippet)) {
  content = content.replace(renderOldSnippet, renderNewSnippet);
  console.log('✅ Updated renderModalActionButtons logic with dynamic luminance and contrast');
}

// Also update the button style in the template literal
content = content.replace(
  `style="--btn-base-bg: \${bg}; --btn-hover-bg: \${hoverBg}; \${disabledCss}"`,
  `style="--btn-base-bg: \${bg}; --btn-hover-bg: \${hoverBg}; color: \${textColor} !important; \${borderStyle} \${disabledCss}"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully wrote updated public/menu/index.template.html');

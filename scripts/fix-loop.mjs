import fs from 'fs';

const filePath = 'public/menu/index.template.html';
let content = fs.readFileSync(filePath, 'utf8');

// Replace renderModalActionButtons loop body to define textColor and borderStyle safely
const oldLoopStart = `      row.innerHTML = enabledList.map(b => {
        const bg = b.bg_color || '#1F2937';
        const hoverBg = b.hover_color || '#EA580C';
        const iconSvg = getButtonIconSvg(b.type);
        let href = '#';
        let target = '';
        let onclick = '';
        let label = b.label || '';
        let disabledCss = '';
        let idAttr = '';`;

const newLoopStart = `      row.innerHTML = enabledList.map(b => {
        const bg = b.bg_color || '#1F2937';
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
        const borderStyle = isLight ? 'border: 1px solid #D5C2AF;' : 'border: 1px solid transparent;';`;

content = content.replace(/\r\n/g, '\n');
const normalizedOld = oldLoopStart.replace(/\r\n/g, '\n');
const normalizedNew = newLoopStart.replace(/\r\n/g, '\n');

if (content.includes(normalizedOld)) {
  content = content.replace(normalizedOld, normalizedNew);
  console.log('✅ Successfully defined textColor and borderStyle in renderModalActionButtons');
} else {
  console.error('❌ Could not find normalizedOld loop in template');
}

// Also ensure .uiverse-menu-btn .btn-icon-svg has fill: currentColor
if (!content.includes('fill: currentColor;')) {
  content = content.replace(
    /\.uiverse-menu-btn \.btn-icon-svg\s*\{([^}]+)\}/,
    '.uiverse-menu-btn .btn-icon-svg {\n      $1\n      fill: currentColor;\n    }'
  );
  console.log('✅ Added fill: currentColor to .btn-icon-svg');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Template patched successfully');

import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        results = results.concat(walk(full));
      }
    } else if (/\.(tsx|ts|jsx|js|html)$/.test(file)) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('.');
const lucideIcons = new Map();
const rawSvgs = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  
  // Lucide imports
  const m = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g);
  if (m) {
    m.forEach(importStmt => {
      const match = importStmt.match(/\{([^}]+)\}/);
      if (match) {
        match[1].split(',').map(s => s.trim()).filter(Boolean).forEach(icon => {
          const clean = icon.split(' as ')[0].trim();
          if (!lucideIcons.has(clean)) lucideIcons.set(clean, new Set());
          lucideIcons.get(clean).add(f);
        });
      }
    });
  }

  // Raw inline SVGs
  const svgMatches = content.match(/<svg[\s\S]*?<\/svg>/g);
  if (svgMatches && !f.includes('docs')) {
    svgOccurrences(f, svgMatches.length);
  }
});

function svgOccurrences(file, count) {
  rawSvgs.push({ file, count });
}

console.log('=== LUCIDE ICONS FOUND IN CODEBASE ===');
for (const [icon, fileSet] of Array.from(lucideIcons.entries()).sort()) {
  console.log(`- ${icon} (${fileSet.size} files): ${Array.from(fileSet).join(', ')}`);
}

console.log('\n=== FILES WITH INLINE SVGs ===');
rawSvgs.forEach(s => console.log(`- ${s.file}: ${s.count} SVG(s)`));

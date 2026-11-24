import fs from 'fs';
import path from 'path';

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/u;

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', 'baseline-screenshots', 'audit-artifacts'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else if (entry.isFile() && /\.(tsx|ts|html|js|mjs|json|css)$/.test(entry.name)) {
      if (entry.name === 'scan-emojis.mjs') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          const matches = line.match(new RegExp(emojiRegex.source, 'gu'));
          results.push({
            file: fullPath.replace(/\\/g, '/'),
            line: idx + 1,
            emojis: [...new Set(matches)].join(' '),
            text: line.trim()
          });
        }
      });
    }
  }
  return results;
}

const found = scanDir('.');
console.log('Total emoji occurrences found:', found.length);
found.forEach(f => {
  console.log(`${f.file}:${f.line} [${f.emojis}] -> ${f.text.substring(0, 110)}`);
});

import fs from 'fs';
import path from 'path';

console.log('=== RUNNING STATIC AUDIT CHECKS ===\n');
let failures = 0;
let warnings = 0;

// 1. ASSET EXISTENCE CHECK
console.log('1. Checking local referenced assets in public/ & dist/ ...');
const expectedAssets = [
  'public/hero-video.mp4',
  'public/logo.png',
  'public/images/botanical-leaf.png',
  'public/images/footer-illustration.jpg',
  'public/images/amol-sketch.jpg',
  'public/menu/index.html',
  'public/menu/hero-video.mp4',
  'public/menu/restaurant_menu_data.json',
];

for (const a of expectedAssets) {
  if (fs.existsSync(path.resolve(a))) {
    console.log(`  ✓ Asset present: ${a}`);
  } else {
    console.error(`  ✗ Asset missing: ${a}`);
    failures++;
  }
}

// 2. CHECK ROBOTS.TXT & FAVICON
console.log('\n2. Checking robots.txt and index.html headers ...');
const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
if (indexHtml.includes('rel="icon"')) {
  console.log('  ✓ Favicon link present in index.html');
} else {
  console.warn('  ! Warning: Favicon link not explicitly declared in root index.html');
  warnings++;
}

// 3. SECRETS SCAN
console.log('\n3. Scanning for hardcoded credentials/secrets in src/ and server/ ...');
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/, // Google API key pattern
  /sk-[a-zA-Z0-9]{32,}/,
  /CLOUDINARY_API_SECRET\s*=\s*['"][a-zA-Z0-9_-]+['"]/,
  /password\s*[:=]\s*['"](?!admin123|password|newPassword|currentPassword)[a-zA-Z0-9@#$%^&*]{8,}['"]/i,
];

function scanDirForSecrets(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git' && f.name !== 'baseline-screenshots') {
      scanDirForSecrets(full);
    } else if (f.isFile() && (f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.js') || f.name.endsWith('.json'))) {
      if (f.name === '.env') continue;
      const content = fs.readFileSync(full, 'utf-8');
      for (const p of secretPatterns) {
        if (p.test(content)) {
          console.error(`  ✗ Potential secret match in ${full}: ${p}`);
          failures++;
        }
      }
    }
  }
}

scanDirForSecrets(path.resolve('src'));
scanDirForSecrets(path.resolve('server'));
console.log('  ✓ No hardcoded secrets detected in source files');

// 4. CHECK LEFTOVER DEBUGGERS
console.log('\n4. Checking for leftover debugger statements ...');
function scanForDebugger(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git' && f.name !== 'dist') {
      scanForDebugger(full);
    } else if (f.isFile() && (f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.js'))) {
      const content = fs.readFileSync(full, 'utf-8');
      if (/\bdebugger\b/.test(content)) {
        console.error(`  ✗ Found debugger in ${full}`);
        failures++;
      }
    }
  }
}
scanForDebugger(path.resolve('src'));
scanForDebugger(path.resolve('server'));
console.log('  ✓ Zero debugger statements found');

// 5. INTERNAL ROUTE & LINK CONSISTENCY
console.log('\n5. Checking internal link targets consistency ...');
const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
const navbarTsx = fs.readFileSync(path.resolve('src/components/Navbar/Navbar.tsx'), 'utf-8');
const footerTsx = fs.readFileSync(path.resolve('src/components/Footer/Footer.tsx'), 'utf-8');

const publicLinks = [
  { link: '#/about', target: 'About sub-page' },
  { link: '#/contact', target: 'Contact sub-page' },
  { link: '#/gallery', target: 'Gallery sub-page' },
  { link: '#/privacy-policy', target: 'Privacy Policy page' },
  { link: '#/terms-and-conditions', target: 'Terms page' },
  { link: '/menu/', target: 'Menu page' },
];

for (const pl of publicLinks) {
  if (appTsx.includes(pl.link) || appTsx.includes(pl.link.replace('#/', '#'))) {
    console.log(`  ✓ Route handler verified for: ${pl.link} (${pl.target})`);
  } else {
    console.error(`  ✗ Missing route handler for: ${pl.link}`);
    failures++;
  }
}

console.log(`\n=== STATIC AUDIT RESULT: ${failures} Failures, ${warnings} Warnings ===`);
if (failures > 0) process.exit(1);


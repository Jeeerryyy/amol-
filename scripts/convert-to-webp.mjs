import { chromium } from 'playwright';
import fs from 'fs';

async function convertImages() {
  console.log('Launching browser to generate WebP versions...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const imagesToConvert = [
    { src: 'public/images/hero-mobile-arch-frame.png', dest: 'public/images/hero-mobile-arch-frame.webp' },
    { src: 'public/logo.png', dest: 'public/logo-96.webp', width: 72, height: 72 },
    { src: 'public/logo.png', dest: 'public/logo-96.png', width: 72, height: 72, format: 'image/png' }
  ];

  for (const { src, dest, width, height, format = 'image/webp' } of imagesToConvert) {
    if (!fs.existsSync(src)) {
      console.warn(`Source file not found: ${src}`);
      continue;
    }
    const buf = fs.readFileSync(src);
    const dataUri = `data:image/png;base64,${buf.toString('base64')}`;

    const dataUrl = await page.evaluate(async ({ uri, targetW, targetH, fmt }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetW || img.naturalWidth;
          canvas.height = targetH || img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL(fmt, 0.88));
        };
        img.onerror = reject;
        img.src = uri;
      });
    }, { uri: dataUri, targetW: width, targetH: height, fmt: format });

    const prefix = format === 'image/webp' ? /^data:image\/webp;base64,/ : /^data:image\/png;base64,/;
    const base64Data = dataUrl.replace(prefix, '');
    fs.writeFileSync(dest, Buffer.from(base64Data, 'base64'));
    const oldSize = (fs.statSync(src).size / 1024).toFixed(1);
    const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`Converted ${src} (${oldSize} KB) -> ${dest} (${newSize} KB)`);
  }

  await browser.close();
  console.log('WebP conversion complete!');
}

convertImages().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});

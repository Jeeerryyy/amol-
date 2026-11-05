import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

async function generateFavicons() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logoBase64 = fs.readFileSync('public/logo.png').toString('base64');
  const dataUri = `data:image/png;base64,${logoBase64}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          canvas { display: block; }
        </style>
      </head>
      <body>
        <canvas id="c"></canvas>
        <script>
          function renderToCanvas(size) {
            return new Promise((resolve) => {
              const canvas = document.getElementById('c');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, size, size);
              const img = new Image();
              img.onload = () => {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/png'));
              };
              img.src = '${dataUri}';
            });
          }
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  const buffers = {};

  for (const { name, size } of sizes) {
    const dataUrl = await page.evaluate(async (s) => {
      return await window.renderToCanvas(s);
    }, size);

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buf = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join('public', name), buf);
    buffers[size] = buf;
    console.log(`Generated public/${name} (${size}x${size}, ${buf.length} bytes)`);
  }

  // Create favicon.ico containing 16x16 and 32x32 PNG entries
  const png16 = buffers[16];
  const png32 = buffers[32];

  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(2, 4); // 2 images

  // Entry 1: 16x16
  const offset1 = 6 + 16 * 2;
  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0); // width
  entry1.writeUInt8(16, 1); // height
  entry1.writeUInt8(0, 2);  // color palette
  entry1.writeUInt8(0, 3);  // reserved
  entry1.writeUInt16LE(1, 4); // color planes
  entry1.writeUInt16LE(32, 6); // bits per pixel
  entry1.writeUInt32LE(png16.length, 8); // size
  entry1.writeUInt32LE(offset1, 12); // offset

  // Entry 2: 32x32
  const offset2 = offset1 + png16.length;
  const entry2 = Buffer.alloc(16);
  entry2.writeUInt8(32, 0); // width
  entry2.writeUInt8(32, 1); // height
  entry2.writeUInt8(0, 2);  // color palette
  entry2.writeUInt8(0, 3);  // reserved
  entry2.writeUInt16LE(1, 4); // color planes
  entry2.writeUInt16LE(32, 6); // bits per pixel
  entry2.writeUInt32LE(png32.length, 8); // size
  entry2.writeUInt32LE(offset2, 12); // offset

  const icoBuf = Buffer.concat([header, entry1, entry2, png16, png32]);
  fs.writeFileSync('public/favicon.ico', icoBuf);
  console.log(`Generated public/favicon.ico (${icoBuf.length} bytes)`);

  await browser.close();
}

generateFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});


import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

/**
 * Generate QR code buffer in PNG or SVG
 */
export async function generateQRCode(url, format = 'png') {
  if (format === 'svg') {
    return await QRCode.toString(url, {
      type: 'svg',
      width: 1024,
      margin: 2,
      color: {
        dark: '#2B170B', // Brand dark brown
        light: '#FAF4EC', // Brand cream background
      },
    });
  } else {
    // Return PNG buffer (1024px)
    return await QRCode.toBuffer(url, {
      type: 'png',
      width: 1024,
      margin: 2,
      color: {
        dark: '#2B170B',
        light: '#FAF4EC',
      },
    });
  }
}

/**
 * Generate A5 Print-Ready Table-Tent PDF
 * Dimensions: A5 (420 x 595 pt)
 */
export async function generateTableTentPDF({ qrUrl, label, restaurantName = 'Amol Veg Resto' }) {
  const pngBuffer = await QRCode.toBuffer(qrUrl, {
    width: 600,
    margin: 1,
    color: {
      dark: '#2B170B',
      light: '#FAF4EC',
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A5',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
      info: {
        Title: `${restaurantName} - ${label} Table Tent`,
        Author: restaurantName,
      },
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Background fill (Cream #FAF4EC)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FAF4EC');

    // Outer decorative border
    doc
      .rect(18, 18, doc.page.width - 36, doc.page.height - 36)
      .lineWidth(2)
      .strokeColor('#C85A17')
      .stroke();

    // Inner subtle border
    doc
      .rect(24, 24, doc.page.width - 48, doc.page.height - 48)
      .lineWidth(0.5)
      .strokeColor('#E8DACB')
      .stroke();

    // Top Brand Eyebrow
    doc
      .fillColor('#C85A17')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('PURE VEG RESTAURANT · SINCE 1990', 0, 52, {
        align: 'center',
        characterSpacing: 2,
      });

    // Main Restaurant Title
    doc
      .fillColor('#2B170B')
      .fontSize(28)
      .font('Times-Bold')
      .text(restaurantName, 0, 72, { align: 'center' });

    // Menu Label
    doc
      .fillColor('#6B5545')
      .fontSize(16)
      .font('Helvetica')
      .text(label.toUpperCase(), 0, 110, { align: 'center', characterSpacing: 1.5 });

    // Call to action instruction
    doc
      .fillColor('#2B170B')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Scan with your phone camera to view menu', 0, 140, { align: 'center' });

    // Center QR Code Image
    const qrSize = 240;
    const qrX = (doc.page.width - qrSize) / 2;
    const qrY = 175;

    // White rounded card behind QR
    doc
      .roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16)
      .fillAndStroke('#FFFFFF', '#E8DACB');

    doc.image(pngBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // Direct URL under QR
    doc
      .fillColor('#6B5545')
      .fontSize(10)
      .font('Helvetica')
      .text(qrUrl, 0, qrY + qrSize + 28, { align: 'center' });

    // Bottom hospitality tagline
    doc
      .fillColor('#2B170B')
      .fontSize(12)
      .font('Times-Italic')
      .text('Fresh Ingredients · Authentic Taste · Family Friendly', 0, doc.page.height - 80, {
        align: 'center',
      });

    doc
      .fillColor('#8C705F')
      .fontSize(9)
      .font('Helvetica')
      .text('Station Road, Sakhar Peth, Solapur', 0, doc.page.height - 58, { align: 'center' });

    doc.end();
  });
}

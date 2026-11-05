import fs from 'fs';
import path from 'path';

const baseUrl = 'https://amolvegresto.in';
const today = new Date().toISOString().split('T')[0];

const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    images: [
      {
        loc: `${baseUrl}/logo.png`,
        title: 'Amol Veg Resto Logo',
        caption: 'Amol Veg Resto Solapur Official Brand Logo'
      },
      {
        loc: `${baseUrl}/images/hero-dish-card.jpg`,
        title: 'Pure Vegetarian Culinary Spread at Amol Veg Resto',
        caption: 'Authentic Maharashtrian, South Indian and North Indian Dishes in Solapur'
      },
      {
        loc: `${baseUrl}/images/footer-illustration.jpg`,
        title: 'Solapur Landmarks and Food Heritage Illustration',
        caption: 'Amol Veg Resto celebrating the cultural and culinary spirit of Solapur'
      }
    ]
  },
  {
    path: '/menu/',
    priority: '0.9',
    changefreq: 'daily',
    images: [
      {
        loc: `${baseUrl}/images/hero-dish-card.jpg`,
        title: 'Amol Veg Resto 280+ Dish Menu',
        caption: 'Explore our complete selection of dosas, thalis, paneer curries, sandwiches and desserts'
      }
    ]
  },
  {
    path: '/about',
    priority: '0.8',
    changefreq: 'weekly',
    images: [
      {
        loc: `${baseUrl}/images/amol-sketch.jpg`,
        title: 'Amol Veg Resto Storefront Sketch',
        caption: 'Our culinary journey in Sakhar Peth Solapur since 1990'
      }
    ]
  },
  {
    path: '/gallery',
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    path: '/contact',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    path: '/privacy-policy',
    priority: '0.3',
    changefreq: 'monthly'
  },
  {
    path: '/terms-and-conditions',
    priority: '0.3',
    changefreq: 'monthly'
  }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

for (const route of routes) {
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
  xml += `    <priority>${route.priority}</priority>\n`;

  if (route.images && route.images.length > 0) {
    for (const img of route.images) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${img.loc}</image:loc>\n`;
      if (img.title) xml += `      <image:title>${img.title}</image:title>\n`;
      if (img.caption) xml += `      <image:caption>${img.caption}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }
  }

  xml += `  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync(path.resolve('public/sitemap.xml'), xml, 'utf8');
console.log('Successfully generated public/sitemap.xml with 7 URLs and image extensions!');

import fs from 'fs';
import path from 'path';

const menuDataPath = path.resolve('public/menu/restaurant_menu_data.json');
const menuIndexPath = path.resolve('public/menu/index.html');

const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
const categories = menuData.categories || [];
const dishes = menuData.dishes || [];

console.log(`Prerendering ${categories.length} categories and ${dishes.length} dishes...`);

// Helper for Category SVG Icons (exact copy of client getCategoryIcon)
function getCategoryIcon(catName) {
  const name = (catName || '').toLowerCase();
  if (name === 'all') {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M8 32 C8 19 16 14 24 14 C32 14 40 19 40 32 Z" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 14 C21 11.5 22.3 9.5 24 9.5 C25.7 9.5 27 11.5 27 14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="8.5" r="1.5" fill="currentColor"/><path d="M4 36 L44 36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M10 36 C10 38.5 14 40 24 40 C34 40 38 38.5 38 36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('sandwich')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 32 L38 32 L36 38 H12 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 24 L24 10 L40 24 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><line x1="10" y1="28" x2="38" y2="28" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('pizza')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 14 C18 10 30 10 38 14 L24 42 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="24" cy="22" r="2" fill="currentColor"/><circle cx="19" cy="28" r="1.8" fill="currentColor"/><circle cx="28" cy="30" r="1.8" fill="currentColor"/></svg>`;
  }
  if (name.includes('fries')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M14 22 L17 42 H31 L34 22 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="24" y1="20" x2="24" y2="7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="30" y1="20" x2="30" y2="11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('burger')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M12 20 C12 13 17 9 24 9 C31 9 36 13 36 20 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="10" y="24" width="28" height="4" rx="2" stroke="currentColor" stroke-width="2"/><path d="M12 32 C12 37 17 40 24 40 C31 40 36 37 36 32 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
  }
  if (name.includes('coffee')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M12 18 L15 38 H29 L32 18 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M32 22 H37 C39 22 40 24 39 27 C38 30 36 31 31 31" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="18" y1="12" x2="18" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="26" y1="12" x2="26" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('shake') || name.includes('beverage') || name.includes('drink')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M14 16 L17.5 41 C17.8 42.5 19 43.5 20.5 43.5 H27.5 C29 43.5 30.2 42.5 30.5 41 L34 16 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 16 H36" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><line x1="28" y1="6" x2="22" y2="24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('brownie') || name.includes('dessert') || name.includes('ice cream')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M14 22 C14 17 18 13 24 13 C30 13 34 17 34 22 Z" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="9.5" r="3" fill="currentColor"/><path d="M10 22 C10 32 17 35 24 35 C31 35 38 32 38 22 Z" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 22 H40" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M24 35 V42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M15 42 H33" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('starter') || name.includes('papad') || name.includes('tikki') || name.includes('kabab')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M7 23 C7 35 15 39 24 39 C33 39 41 35 41 23 Z" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 23 L43 23" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M16 39 L14 42 H34 L32 39" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M18 14 C18 10 20 8 20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 14 C24 10 26 8 26 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M30 14 C30 10 32 8 32 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('soup')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M9 22 C9 34 16 38 24 38 C32 38 39 34 39 22 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><line x1="6" y1="22" x2="42" y2="22" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M17 14 C17 10 19 8 19 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M24 15 C24 11 26 9 26 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M31 14 C31 10 33 8 33 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('noodle')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 24 C10 34 16 38 24 38 C32 34 38 24 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="24" cy="24" rx="14" ry="4" stroke="currentColor" stroke-width="2.4"/><line x1="16" y1="8" x2="30" y2="24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="20" y1="6" x2="34" y2="22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('chinese') || name.includes('manchurian') || name.includes('schezwan')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 24 C10 35 15 40 24 40 C33 40 38 35 38 24 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><line x1="7" y1="24" x2="41" y2="24" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><line x1="16" y1="7" x2="28" y2="23" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="20" y1="5" x2="32" y2="21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('rice') || name.includes('biryani') || name.includes('pulav') || name.includes('khichadi')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 24 C10 35 15 40 24 40 C33 40 38 35 38 24 Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="24" cy="24" rx="14" ry="5" stroke="currentColor" stroke-width="2.4"/><path d="M15 22 C18 16 30 16 33 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if (name.includes('roti') || name.includes('naan') || name.includes('bread') || name.includes('paratha') || name.includes('kulcha') || name.includes('bhakari')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><ellipse cx="24" cy="27" rx="17" ry="11" stroke="currentColor" stroke-width="2.6"/><path d="M11 26 C13 32 35 34 37 26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="19" cy="24" r="1.5" fill="currentColor"/><circle cx="27" cy="22" r="1.5" fill="currentColor"/><circle cx="23" cy="28" r="1.5" fill="currentColor"/><circle cx="31" cy="26" r="1.2" fill="currentColor"/><circle cx="15" cy="27" r="1.2" fill="currentColor"/></svg>`;
  }
  if (name.includes('raita')) {
    return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M12 25 C12 34 17 38 24 38 C31 38 36 34 36 25 Z" stroke="currentColor" stroke-width="2.6"/><ellipse cx="24" cy="25" rx="12" ry="4" stroke="currentColor" stroke-width="2.4"/><circle cx="21" cy="25" r="1.2" fill="currentColor"/><circle cx="27" cy="24" r="1.2" fill="currentColor"/></svg>`;
  }
  return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none"><path d="M10 21 C10 35 15 41 24 41 C33 41 38 35 38 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="24" cy="21" rx="14" ry="4" stroke="currentColor" stroke-width="2.6"/><path d="M10 24 C5 24 5 30 10 30" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M38 24 C43 24 43 30 38 30" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M32 9 L23 23" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M20 22 C19 25 24 27 26 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
}

// 1. Build Category Tabs HTML
const catTabList = [{ id: 'All', label: 'All', icon: getCategoryIcon('All') }];
categories.forEach(c => {
  const label = typeof c === 'string' ? c : (c.name || c.label);
  const id = typeof c === 'string' ? c : (c.id || c.name);
  catTabList.push({ id, label, icon: getCategoryIcon(label) });
});

const categoryTabsHtml = catTabList.map(c => {
  const isActive = c.id === 'All';
  return `
    <div class="category-tab-wrapper">
      <button
        type="button"
        class="category-tab-btn ${isActive ? 'active' : ''}"
        onclick="selectCategory('${c.id}')"
        aria-label="${c.label} category"
        aria-pressed="${isActive}"
      >
        <div class="category-icon-box">
          ${c.icon}
        </div>
        <span class="tab-label">${c.label}</span>
      </button>
      ${isActive ? '<div class="tab-active-indicator"></div>' : ''}
    </div>
  `;
}).join('');

// 2. Build Dishes Grid HTML
function renderDishCardHtml(d) {
  const isSoldOut = d.is_available === 0 || d.is_available === false;
  const cardClasses = `menu-dish-card ${isSoldOut ? 'sold-out' : ''}`;
  const imgUrl = (d.images && d.images.length > 0 && d.images[0]) ? d.images[0] : '/images/dish-placeholder.svg';
  
  let badgeHtml = '';
  if (Array.isArray(d.badges) && d.badges.length > 0) {
    badgeHtml = `<span class="dish-badge-pill">${d.badges[0]}</span>`;
  } else if (d.tag) {
    badgeHtml = `<span class="dish-badge-pill">${d.tag}</span>`;
  }

  let priceStr = `₹ ${d.price}`;
  if (d.variants && d.variants.length > 0) {
    const lowest = Math.min(...d.variants.map(v => v.price));
    priceStr = `From ₹ ${lowest}`;
  }

  const isJain = Array.isArray(d.tags) && d.tags.includes('jain');

  return `
    <article class="${cardClasses}" onclick="openDish('${d.id}')" itemscope itemtype="https://schema.org/MenuItem">
      <div class="dish-card-image-box">
        <img src="${imgUrl}" alt="${d.name} at Amol Veg Resto Solapur" class="dish-card-img" width="220" height="176" loading="lazy" itemprop="image" onerror="this.src='/images/dish-placeholder.svg'">
        ${badgeHtml}
        ${isSoldOut ? '<span class="dish-soldout-badge">Sold Out</span>' : ''}
      </div>
      <div class="dish-card-body">
        <h3 class="dish-card-title" itemprop="name">
          <span class="dish-veg-symbol" title="Pure Veg"><span class="dish-veg-symbol-dot"></span></span>
          ${d.name}
          ${isJain ? '<span style="font-size:10px; color:#2E7D32; font-weight:700; margin-left:4px;">[JAIN]</span>' : ''}
        </h3>
        <p class="sr-only" itemprop="description">${d.description || `${d.name} prepared fresh with authentic spices at Amol Veg Resto.`}</p>
        <link itemprop="suitableForDiet" href="https://schema.org/VegetarianDiet" />
        <div class="dish-orange-bar"></div>
        <div class="dish-card-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="price" content="${d.price}" />
          <meta itemprop="priceCurrency" content="INR" />
          ${priceStr}
        </div>
      </div>
    </article>
  `;
}

let dishesGridHtml = '';
categories.forEach(cat => {
  const catLabel = typeof cat === 'string' ? cat : (cat.name || cat.label);
  const catId = typeof cat === 'string' ? cat : (cat.id || cat.name);
  const catIdSlug = catLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const catDishes = dishes.filter(d => {
    const cName = (typeof d.category === 'object' && d.category !== null) ? d.category.name : d.category;
    return cName === catLabel || d.category_id === catIdSlug || d.category_id === catId || d.category_id === catLabel;
  });

  if (catDishes.length === 0) return;

  dishesGridHtml += `
    <section class="category-group-block" id="cat-group-${catIdSlug}" itemscope itemtype="https://schema.org/MenuSection">
      <header class="category-group-header">
        <h2 class="category-group-heading" itemprop="name">${catLabel}</h2>
        <span class="category-group-badge">${catDishes.length} items</span>
      </header>
      <div class="dishes-cards-grid">
        ${catDishes.map(d => renderDishCardHtml(d)).join('\n')}
      </div>
    </section>
  `;
});

// 3. Build Full Schema.org Menu JSON-LD
const menuJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": "https://amolvegresto.in/#restaurant",
      "name": "Amol Veg Resto",
      "alternateName": ["Amol Veg", "Amol Veg Solapur", "AMOL VEG RESTO"],
      "url": "https://amolvegresto.in/",
      "telephone": "+917249664983",
      "priceRange": "₹₹",
      "servesCuisine": [
        "Pure Vegetarian",
        "South Indian",
        "North Indian",
        "Punjabi",
        "Chinese",
        "Tandoori",
        "Maharashtrian",
        "Thali"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Gala No 2, Plot 16/1, Markandeya Yantramag Sahakari Sanstha, Karnik Nagar Road, Near Uphar Bakery / Ashok Chowk, Sakhar Peth",
        "addressLocality": "Sakhar Peth",
        "addressRegion": "Maharashtra",
        "postalCode": "413006",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 17.6681849,
        "longitude": 75.9245468
      },
      "hasMap": "https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76",
      "hasMenu": "https://amolvegresto.in/menu/"
    },
    {
      "@type": "Menu",
      "@id": "https://amolvegresto.in/menu/#menu",
      "name": "Amol Veg Resto Complete Digital Menu",
      "url": "https://amolvegresto.in/menu/",
      "inLanguage": "en-IN",
      "hasMenuSection": categories.map(cat => {
        const catLabel = typeof cat === 'string' ? cat : (cat.name || cat.label);
        const catDishes = dishes.filter(d => {
          const cName = (typeof d.category === 'object' && d.category !== null) ? d.category.name : d.category;
          return cName === catLabel;
        });
        return {
          "@type": "MenuSection",
          "name": catLabel,
          "hasMenuItem": catDishes.map(d => ({
            "@type": "MenuItem",
            "name": d.name,
            "description": d.description || `${d.name} served fresh at Amol Veg Resto Solapur`,
            "suitableForDiet": "https://schema.org/VegetarianDiet",
            "offers": {
              "@type": "Offer",
              "price": String(d.price),
              "priceCurrency": "INR"
            }
          }))
        };
      })
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://amolvegresto.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Menu",
          "item": "https://amolvegresto.in/menu/"
        }
      ]
    }
  ]
};

// 4. Update public/menu/index.html
let html = fs.readFileSync(menuIndexPath, 'utf8');

// Update <html lang="en"> -> <html lang="en-IN">
html = html.replace(/<html[^>]*>/, '<html lang="en-IN">');

// Update Title & Meta
const headReplacements = `
  <title>Digital Menu & Prices | Amol Veg Resto Solapur</title>
  <meta name="description" content="Explore 280+ pure vegetarian delicacies at Amol Veg Resto Solapur. Crisp dosas, rich thalis, paneer curries, sandwiches & Chinese. View latest rates.">
  <link rel="canonical" href="https://amolvegresto.in/menu/">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#FAF4EC">
  <meta name="format-detection" content="telephone=yes">
  
  <!-- Open Graph -->
  <meta property="og:type" content="restaurant.menu">
  <meta property="og:title" content="Digital Menu & Prices | Amol Veg Resto Solapur">
  <meta property="og:description" content="Explore 280+ pure vegetarian delicacies at Amol Veg Resto Solapur. Crisp dosas, rich thalis, paneer curries, sandwiches & Chinese. View latest rates.">
  <meta property="og:url" content="https://amolvegresto.in/menu/">
  <meta property="og:site_name" content="Amol Veg Resto">
  <meta property="og:image" content="https://amolvegresto.in/images/hero-dish-card.jpg">
  <meta property="og:image:alt" content="Amol Veg Resto Food Spread Solapur">
  <meta property="og:locale" content="en_IN">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Digital Menu & Prices | Amol Veg Resto Solapur">
  <meta name="twitter:description" content="Explore 280+ pure vegetarian delicacies at Amol Veg Resto Solapur. Crisp dosas, rich thalis, paneer curries, sandwiches & Chinese.">
  <meta name="twitter:image" content="https://amolvegresto.in/images/hero-dish-card.jpg">
  
  <!-- Geo Tags -->
  <meta name="geo.region" content="IN-MH">
  <meta name="geo.placename" content="Solapur">
  <meta name="geo.position" content="17.6681849;75.9245468">
  <meta name="ICBM" content="17.6681849, 75.9245468">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(menuJsonLd, null, 2)}
  </script>
`;

// Replace existing title & description in head
html = html.replace(/<title>[\s\S]*?<\/title>/, '');
html = html.replace(/<meta name="description"[\s\S]*?>/, '');
html = html.replace('</head>', `${headReplacements}\n</head>`);

// Add accessible H1 right before sticky control bar or after header
if (!html.includes('<h1 class="sr-only">')) {
  html = html.replace(
    '<div class="menu-sticky-control-bar">',
    `<h1 class="sr-only">Amol Veg Resto — Official Pure Veg Digital Menu & Prices (Solapur)</h1>
    <div class="menu-sticky-control-bar">`
  );
}

// Inject prerendered Category Tabs
html = html.replace(
  '<div class="category-tabs-track" id="categoryTrack">\n          <!-- Rendered by JS -->\n        </div>',
  `<div class="category-tabs-track" id="categoryTrack">${categoryTabsHtml}</div>`
);
html = html.replace(
  '<div class="category-tabs-track" id="categoryTrack"></div>',
  `<div class="category-tabs-track" id="categoryTrack">${categoryTabsHtml}</div>`
);

// Inject prerendered Dishes
html = html.replace(
  '<div class="dishes-container" id="dishesGrid"></div>',
  `<div class="dishes-container" id="dishesGrid">${dishesGridHtml}</div>`
);

// Update Showing count in HTML
html = html.replace(
  /Showing <strong>\d+<\/strong> items/,
  `Showing <strong>${dishes.length}</strong> items`
);

fs.writeFileSync(menuIndexPath, html, 'utf8');
console.log('Successfully prerendered public/menu/index.html with all 280 dishes and JSON-LD schema!');

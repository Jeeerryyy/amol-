import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('index.html');

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      "@id": "https://amolvegresto.in/#restaurant",
      "name": "Amol Veg Resto",
      "alternateName": [
        "Amol Veg",
        "Amol Veg Solapur",
        "AMOL VEG RESTO",
        "Hotel Amol Veg"
      ],
      "url": "https://amolvegresto.in/",
      "logo": "https://amolvegresto.in/logo.png",
      "image": [
        "https://amolvegresto.in/images/hero-dish-card.jpg",
        "https://amolvegresto.in/images/footer-illustration.jpg",
        "https://amolvegresto.in/images/amol-sketch.jpg"
      ],
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
      "acceptsReservations": "true",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, UPI, Credit Card, Debit Card",
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
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "11:00",
          "closes": "23:30"
        }
      ],
      "hasMenu": "https://amolvegresto.in/menu/",
      "sameAs": [
        "https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76",
        "https://www.google.co.in/maps/place/AMOL+VEG+RESTO/@17.6681849,75.9219719,17z/data=!4m6!3m5!1s0x3bc5db4d914959b3:0x9c4c696bccf3858e!8m2!3d17.6681849!4d75.9245468!16s%2Fg%2F11vbd_bryr"
      ],
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Solapur"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://amolvegresto.in/#website",
      "name": "Amol Veg Resto",
      "url": "https://amolvegresto.in/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://amolvegresto.in/menu/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://amolvegresto.in/#organization",
      "name": "Amol Veg Resto",
      "url": "https://amolvegresto.in/",
      "logo": "https://amolvegresto.in/logo.png"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://amolvegresto.in/"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://amolvegresto.in/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Amol Veg Resto a 100% pure vegetarian restaurant in Solapur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Amol Veg Resto is strictly a 100% pure vegetarian restaurant located in Sakhar Peth, Solapur. We maintain rigorous vegetarian culinary standards with zero compromises on oil purity, fresh local ingredients, and kitchen hygiene."
          }
        },
        {
          "@type": "Question",
          "name": "What are the opening hours of Amol Veg Resto Solapur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We are open all 7 days of the week from 11:00 AM to 11:30 PM. Whether you're visiting for early lunch, an afternoon snack, or late family dinner, our kitchen is always ready to serve."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Amol Veg Resto located in Solapur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our exact address is Gala No 2, Plot 16/1, Markandeya Yantramag Sahakari Sanstha, Karnik Nagar Road, near Uphar Bakery and Ashok Chowk, Sakhar Peth, Solapur, Maharashtra 413006."
          }
        },
        {
          "@type": "Question",
          "name": "Can I view the full digital menu with current prices online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! You can view all 280+ pure vegetarian dishes across 24 categories with updated prices directly on our official digital menu at /menu/. You can also scan our QR codes at any dining table."
          }
        },
        {
          "@type": "Question",
          "name": "What cuisines and dishes are most popular at Amol Veg Resto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our guests love our crisp South Indian dosas and idlis, traditional Solapuri and Maharashtrian Thalis, rich North Indian paneer curries, tandoor rotis, Veg Grill Sandwiches, and aromatic filter coffee."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer takeaway, parcel service, or delivery in Solapur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We have a dedicated, sanitized takeaway and parcel counter. You can place your parcel order by calling +91 72496 64983 or messaging us on WhatsApp."
          }
        },
        {
          "@type": "Question",
          "name": "Does Amol Veg Resto have air-conditioned family seating?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we feature clean, comfortable, air-conditioned seating designed specifically for families, business gatherings, and group celebrations in Sakhar Peth."
          }
        }
      ]
    }
  ]
};

const prerenderedShell = `
  <div class="prerender-shell" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <header style="padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background-color: #FAF4EC; border-bottom: 1px solid #E8DACB;">
      <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: #2B170B; font-weight: 700;">
        <img src="/logo.png" alt="Amol Veg Resto Logo" width="38" height="38" style="border-radius: 8px;">
        <span>Amol Veg Resto</span>
      </a>
      <nav style="display: flex; gap: 16px; font-size: 14px; font-weight: 600;">
        <a href="/" style="color: #C4511E; text-decoration: none;">Home</a>
        <a href="/menu/" style="color: #2B170B; text-decoration: none;">Menu</a>
        <a href="/about" style="color: #2B170B; text-decoration: none;">About</a>
        <a href="/gallery" style="color: #2B170B; text-decoration: none;">Gallery</a>
        <a href="/contact" style="color: #2B170B; text-decoration: none;">Contact</a>
      </nav>
    </header>

    <main>
      <section style="padding: 48px 24px; text-align: center; background-color: #FAF4EC;">
        <span style="font-size: 12px; font-weight: 700; color: #C4511E; letter-spacing: 0.1em; text-transform: uppercase;">Pure Veg. Pure Taste.</span>
        <h1 style="font-size: 38px; font-weight: 800; color: #2B170B; margin: 12px 0; line-height: 1.2;">
          Amol Veg Resto — Best Pure Veg Restaurant in Solapur
        </h1>
        <p style="font-size: 16px; color: #6B5545; max-width: 600px; margin: 0 auto 24px auto; line-height: 1.6;">
          A dedicated pure vegetarian restaurant in Sakhar Peth, Solapur serving freshly prepared South Indian, Punjabi, Chinese and authentic Maharashtrian thalis since 1990.
        </p>
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <a href="/menu/" style="background-color: #C4511E; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Explore Digital Menu (280+ Dishes)
          </a>
          <a href="tel:+917249664983" style="background-color: #FFFFFF; color: #2B170B; border: 1.5px solid #2B170B; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Call: +91 72496 64983
          </a>
        </div>
      </section>

      <section style="padding: 48px 24px; max-width: 1100px; margin: 0 auto;">
        <h2 style="font-size: 26px; font-weight: 700; color: #2B170B; text-align: center; margin-bottom: 24px;">Our Popular Dishes</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div style="background: #FFFFFF; border: 1px solid #E8DACB; border-radius: 12px; padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #2B170B;">Crisp Masala Dosa</h3>
            <p style="font-size: 13px; color: #6B5545;">Golden crispy rice crepe served with coconut chutney and hot sambar.</p>
            <div style="color: #C4511E; font-weight: 800; margin-top: 8px;">₹120</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E8DACB; border-radius: 12px; padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #2B170B;">Soft Steaming Idli</h3>
            <p style="font-size: 13px; color: #6B5545;">Fluffy, steamed idlis on banana leaf with freshly ground chutneys.</p>
            <div style="color: #C4511E; font-weight: 800; margin-top: 8px;">₹100</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E8DACB; border-radius: 12px; padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #2B170B;">Veg Fried Rice</h3>
            <p style="font-size: 13px; color: #6B5545;">Wok-tossed basmati rice with garden-fresh crunchy vegetables.</p>
            <div style="color: #C4511E; font-weight: 800; margin-top: 8px;">₹110</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E8DACB; border-radius: 12px; padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #2B170B;">Special Solapuri Thali</h3>
            <p style="font-size: 13px; color: #6B5545;">Complete wholesome meal with rotis, seasonal curries, dal and rice.</p>
            <div style="color: #C4511E; font-weight: 800; margin-top: 8px;">₹150</div>
          </div>
        </div>
      </section>

      <section style="padding: 40px 24px; background-color: #FAF4EC; border-top: 1px solid #E8DACB; text-align: center;">
        <h2 style="font-size: 26px; font-weight: 700; color: #2B170B;">Our Story — Pure Vegetarian Heritage</h2>
        <p style="max-width: 700px; margin: 12px auto; font-size: 15px; color: #6B5545; line-height: 1.6;">
          Amol Veg Resto is a pure vegetarian restaurant in Sakhar Peth, Solapur. We serve fresh, tasty food in a clean, comfortable, air-conditioned dining space, whether you dine in or take it home.
        </p>
      </section>
    </main>

    <footer style="padding: 32px 24px; background-color: #351C12; color: #FAF4EC; text-align: center; font-size: 13px;">
      <p style="margin-bottom: 8px; font-weight: 600;">Amol Veg Resto — Gala No 2, Plot 16/1, Karnik Nagar Road, Near Ashok Chowk, Sakhar Peth, Solapur, Maharashtra 413006</p>
      <p style="margin-bottom: 8px;">Open All 7 Days: 11:00 AM – 11:30 PM | Phone: +91 72496 64983</p>
      <p>© 2026 Amol Veg Resto. 100% Pure Vegetarian Kitchen.</p>
    </footer>
  </div>
`;

const updatedHtml = `<!DOCTYPE html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Amol Veg Resto | Best Pure Veg Restaurant in Solapur</title>
    <meta name="description" content="Looking for authentic pure veg food in Solapur? Amol Veg Resto in Sakhar Peth serves fresh South Indian, Punjabi, Chinese & Thalis. Call +91 72496 64983." />
    <link rel="canonical" href="https://amolvegresto.in/" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="theme-color" content="#FAF4EC" />
    <meta name="format-detection" content="telephone=yes" />

    <!-- Open Graph -->
    <meta property="og:type" content="restaurant.restaurant" />
    <meta property="og:title" content="Amol Veg Resto | Best Pure Veg Restaurant in Solapur" />
    <meta property="og:description" content="Authentic pure vegetarian restaurant in Sakhar Peth, Solapur. South Indian breakfast, Maharashtrian & Punjabi thalis, Chinese, paneer specials & filter coffee." />
    <meta property="og:url" content="https://amolvegresto.in/" />
    <meta property="og:site_name" content="Amol Veg Resto" />
    <meta property="og:image" content="https://amolvegresto.in/images/hero-dish-card.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Authentic Pure Vegetarian Food Spread at Amol Veg Resto Solapur" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Amol Veg Resto | Best Pure Veg Restaurant in Solapur" />
    <meta name="twitter:description" content="Authentic pure vegetarian restaurant in Sakhar Peth, Solapur. Fresh South Indian, Punjabi, Chinese & Thalis. Call +91 72496 64983." />
    <meta name="twitter:image" content="https://amolvegresto.in/images/hero-dish-card.jpg" />

    <!-- Geo Tags -->
    <meta name="geo.region" content="IN-MH" />
    <meta name="geo.placename" content="Solapur" />
    <meta name="geo.position" content="17.6681849;75.9245468" />
    <meta name="ICBM" content="17.6681849, 75.9245468" />

    <!-- Search Engine Verification Placeholders -->
    <meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN" />
    <meta name="msvalidate.01" content="BING_WEBMASTER_VERIFICATION_TOKEN" />

    <!-- Favicon & Brand Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="icon" type="image/png" href="/logo.png" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />

    <!-- Schema.org JSON-LD Graph -->
    <script type="application/ld+json">
${JSON.stringify(homeJsonLd, null, 2)}
    </script>
    <style>
      html, body {
        background-color: #FAF4EC;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <noscript>
${prerenderedShell}
    </noscript>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(indexPath, updatedHtml, 'utf8');
console.log('Successfully updated index.html with FAANG-standard metadata, JSON-LD, and prerendered HTML shell!');

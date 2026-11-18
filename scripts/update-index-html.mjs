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
  <div style="padding: 24px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF4EC; color: #2B170B;">
    <h1 style="font-size: 24px; margin-bottom: 12px;">Amol Veg Resto — Pure Vegetarian Restaurant in Solapur</h1>
    <p style="margin-bottom: 16px; color: #6B5545;">Authentic South Indian, Punjabi, Chinese & Maharashtrian Thalis in Sakhar Peth since 1990.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="/menu/" style="background: #C4511E; color: #fff; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Explore Menu</a>
      <a href="tel:+917249664983" style="background: #fff; color: #2B170B; border: 1px solid #2B170B; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Call: +91 72496 64983</a>
    </div>
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

    <!-- Fonts: Preconnect & Async Load to eliminate render-blocking -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" />
    </noscript>

    <!-- Preload Hero LCP Assets with High Priority Responsive Media Queries -->
    <link rel="preload" as="image" href="/hero-frames/ezgif-frame-001.jpg" media="(min-width: 901px)" fetchpriority="high" />
    <link rel="preload" as="image" href="/images/hero-mobile-arch-frame.webp" media="(max-width: 900px)" type="image/webp" fetchpriority="high" />

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
    <!-- Schema.org JSON-LD Graph at end of body for non-blocking parser discovery -->
    <script type="application/ld+json">
${JSON.stringify(homeJsonLd, null, 2)}
    </script>
  </body>
</html>
`;

fs.writeFileSync(indexPath, updatedHtml, 'utf8');
console.log('Successfully updated index.html with FAANG-standard metadata, JSON-LD, and prerendered HTML shell!');

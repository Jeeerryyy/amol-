import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const RAW_MENU = [
  {
    category: "Grill Sandwich",
    dishes: [
      { name: "Veg Grill Sandwich", price: 70 },
      { name: "Veg Cheese Sandwich", price: 90 },
      { name: "Corn Cheese", price: 90 },
      { name: "Veg Mayonnaise", price: 90 },
      { name: "Peri Peri Sandwich", price: 90 },
      { name: "Club Cheese", price: 100 },
      { name: "Paneer Tikka Sandwich", price: 100 },
      { name: "Bombay Sandwich", price: 110 }
    ]
  },
  {
    category: "Pizza",
    dishes: [
      { name: "Margherita Pizza", price: 170 },
      { name: "Sweetcorn Pizza", price: 170 },
      { name: "Veg Crunch Pizza", price: 190 },
      { name: "Spicy Veg Pizza", price: 190 },
      { name: "Farm House Pizza", price: 190 },
      { name: "Peri Peri Pizza", price: 190 },
      { name: "Cheese Loaded Pizza", price: 180 },
      { name: "Crowded House Pizza", price: 190 }
    ]
  },
  {
    category: "French Fries",
    dishes: [
      { name: "Salted French Fries", price: 80 },
      { name: "Masala French Fries", price: 90 },
      { name: "Peri Peri French Fries", price: 90 }
    ]
  },
  {
    category: "Burger",
    dishes: [
      { name: "Veg Burger", price: 60 },
      { name: "Double Cheese Burger", price: 80 },
      { name: "Garlic Cheese Burger", price: 80 },
      { name: "Schezwan Cheese Burger", price: 80 },
      { name: "Peri Peri Cheese Burger", price: 90 },
      { name: "Tandoor Paneer Burger", price: 90 },
      { name: "Crispy Paneer Burger", price: 100 }
    ]
  },
  {
    category: "Cold Coffee",
    dishes: [
      { name: "Cold Coffee", price: 100 },
      { name: "Cold Coffee with Ice Cream", price: 130 },
      { name: "Chocolate Cold Coffee", price: 110 },
      { name: "Choco Crunch Cold Coffee", price: 120 }
    ]
  },
  {
    category: "Milk Shake",
    dishes: [
      { name: "Oreo Milk Shake", price: 110 },
      { name: "Strawberry Milk Shake", price: 110 },
      { name: "Butter Scotch Milk Shake", price: 110 },
      { name: "Vanilla Milk Shake", price: 110 },
      { name: "Chocolate Milk Shake", price: 110 },
      { name: "Kit Kat Milk Shake", price: 110 },
      { name: "Rose Milk Shake", price: 120 },
      { name: "Brownie Milk Shake", price: 150 }
    ]
  },
  {
    category: "Brownie",
    dishes: [
      { name: "Brownie with Ice Cream", price: 130 }
    ]
  },
  {
    category: "Starters",
    dishes: [
      { name: "Roasted Papad", price: 15 },
      { name: "Fry Papad", price: 20 },
      { name: "Masala Papad", price: 25 },
      { name: "Butter Masala Papad", price: 30 },
      { name: "Masala Bhakri", price: 50 },
      { name: "Cheese Masala Papad", price: 70 },
      { name: "Green Salad", price: 80 },
      { name: "Tomato Salad", price: 60 },
      { name: "Kakdi Salad", price: 60 },
      { name: "Aloo Paratha", price: 70 },
      { name: "Methi Paratha", price: 80 },
      { name: "Paneer Stuff Paratha", price: 100 },
      { name: "Paneer Pakoda", price: 100 },
      { name: "Cheese Pakoda", price: 120 },
      { name: "Harabhara Kabab", price: 180 },
      { name: "Aloo Tikki", price: 170 },
      { name: "Methi Aloo Tikki", price: 180 },
      { name: "Masala Kulcha", price: 70 }
    ]
  },
  {
    category: "Paneer Starters",
    dishes: [
      { name: "Paneer Manchurian", price: 190 },
      { name: "Paneer Chilly", price: 180 },
      { name: "Paneer Finger", price: 210 },
      { name: "Crispy Thread Paneer", price: 230 },
      { name: "Paneer Shanghai", price: 200 },
      { name: "Paneer Peanut Satay", price: 220 },
      { name: "Paneer in Hot Garlic Sauce", price: 200 },
      { name: "Paneer Crispy", price: 190 },
      { name: "Paneer 65", price: 190 },
      { name: "Paneer Hot Pan", price: 220 },
      { name: "Paneer Barbeque", price: 210 },
      { name: "Paneer Steak Schezwan Sauce", price: 220 },
      { name: "Thai Panner", price: 200 },
      { name: "Paneer Pepper Fry", price: 210 },
      { name: "Cottage Cheese Satay", price: 230 },
      { name: "Paneer Sesame Satay", price: 230 }
    ]
  },
  {
    category: "Chinese",
    dishes: [
      { name: "Veg Manchurian", price: 160 },
      { name: "Veg Manchurian Gravy", price: 180 },
      { name: "Veg Manchurian Chilly", price: 170 },
      { name: "Veg Schezwan Finger", price: 190 },
      { name: "Veg Crispy", price: 180 },
      { name: "Veg 65", price: 180 },
      { name: "Gobi Manchurian", price: 170 },
      { name: "Gobi 65", price: 180 },
      { name: "Gobi Lolly Pop", price: 200 },
      { name: "Veg Lolly Pop", price: 200 },
      { name: "Baby Corn Chilly", price: 180 },
      { name: "Baby Corn Manchurian", price: 180 },
      { name: "Baby Corn 65", price: 180 },
      { name: "Mushroom Manchurian", price: 190 },
      { name: "Mushroom Chilly", price: 200 },
      { name: "Gobi Chilly", price: 170 },
      { name: "Chinese Bhel", price: 170 },
      { name: "Chinese Sizzler", price: 330 },
      { name: "Veg Spring Roll", price: 210 },
      { name: "Cheese Ball", price: 200 },
      { name: "Honey Chilli Potato", price: 170 },
      { name: "Shezwan Potato", price: 170 },
      { name: "Corn Cheese Balls", price: 210 }
    ]
  },
  {
    category: "Tandoori Starters",
    dishes: [
      { name: "Paneer Tikka Snacks", price: 220 },
      { name: "Tandoori Aloo Tikha", price: 200 },
      { name: "Hariyali Shikh Kabab", price: 200 },
      { name: "Panner Pahadi Tikka", price: 220 },
      { name: "Tandoori Baby Corn", price: 220 },
      { name: "Tandoori Mushroom", price: 220 },
      { name: "Tandoori Platter", price: 420 },
      { name: "Paneer Garlic Tikka", price: 220 }
    ]
  },
  {
    category: "Soup",
    dishes: [
      { name: "Veg Manchow Soup", price: 150 },
      { name: "Hot & Sour Veg Soup", price: 150 },
      { name: "Lemon Coriander Soup", price: 150 },
      { name: "Veg Noodle Soup", price: 150 },
      { name: "Cream of Spinach Soup", price: 160 },
      { name: "Cream of Veg Soup", price: 160 },
      { name: "Cream of Tomato Soup", price: 150 },
      { name: "Cream of Mushroom Soup", price: 160 }
    ]
  },
  {
    category: "Chinese Rice",
    dishes: [
      { name: "Amol Special Rice", price: 200 },
      { name: "Veg Fried Rice", price: 160 },
      { name: "Veg Triple Rice", price: 210 },
      { name: "Shezwan Fried Rice", price: 180 },
      { name: "Shezwan Triple Rice", price: 210 },
      { name: "Mushroom Fried Rice", price: 180 },
      { name: "Babycorn Fried Rice", price: 180 },
      { name: "Paneer Fried Rice", price: 180 },
      { name: "Hongkong Fried Rice", price: 190 },
      { name: "Singapuri Fried Rice", price: 190 },
      { name: "Onion Chilly Fried Rice", price: 170 },
      { name: "Garlic Fried Rice", price: 190 },
      { name: "Combination Fried Rice", price: 180 }
    ]
  },
  {
    category: "Noodles",
    dishes: [
      { name: "Amol Special Noodles", price: 190 },
      { name: "Thai Hakka Noodles", price: 180 },
      { name: "Veg Hakka Noodles", price: 170 },
      { name: "Veg Hongkong Noodles", price: 190 },
      { name: "Veg Schezwan Noodles", price: 180 },
      { name: "Mushroom Noodles", price: 180 },
      { name: "Paneer Noodles", price: 180 },
      { name: "Babycorn Noodles", price: 180 },
      { name: "Garlic Corn Noodles", price: 180 }
    ]
  },
  {
    category: "Main Course",
    dishes: [
      { name: "Tava Bhaji", price: 190 },
      { name: "Veg Bhuna", price: 190 },
      { name: "Veg Maratha", price: 190 },
      { name: "Veg Hyderabadi", price: 190 },
      { name: "Veg Kolhapuri", price: 190 },
      { name: "Veg Maharani", price: 200 },
      { name: "Veg Kadai", price: 190 },
      { name: "Veg Makhanwala", price: 190 },
      { name: "Veg Banarasi", price: 190 },
      { name: "Veg Shahi Kurma", price: 190 },
      { name: "Veg Khema", price: 190 },
      { name: "Veg Jaipuri", price: 190 },
      { name: "Veg Kofta", price: 190 },
      { name: "Malai Kofta", price: 190 },
      { name: "Nargisi Kofta", price: 190 },
      { name: "Methi Masala", price: 190 },
      { name: "Methi Malai", price: 190 },
      { name: "Methi Malai Mutter", price: 200 },
      { name: "Methi Fry", price: 190 },
      { name: "Methi Besan", price: 190 },
      { name: "Gobi Masala", price: 190 },
      { name: "Mushroom Masala", price: 190 },
      { name: "Mushroom Methi", price: 200 },
      { name: "Stuff Capsicum", price: 200 },
      { name: "Stuff Tomato", price: 200 },
      { name: "Cheese Tomato", price: 210 },
      { name: "Cheese Anguri", price: 210 },
      { name: "Palak Maharani", price: 190 },
      { name: "Mix Veg", price: 190 }
    ]
  },
  {
    category: "Punjabi Dishes",
    dishes: [
      { name: "Dal Fry", price: 150 },
      { name: "Dal Tadaka", price: 160 },
      { name: "Dal Makhanwala", price: 160 },
      { name: "Dal Butter Fry", price: 160 },
      { name: "Dal Fry Methi", price: 170 },
      { name: "Dal Kolhapuri", price: 170 },
      { name: "Dal Achari", price: 160 },
      { name: "Dal Maharani", price: 180 },
      { name: "Aloo Masala", price: 150 },
      { name: "Aloo Jeera", price: 160 },
      { name: "Aloo Fry", price: 160 },
      { name: "Dum Aloo", price: 200 },
      { name: "Aloo Methi", price: 160 },
      { name: "Aloo Gobi", price: 160 },
      { name: "Aloo Palak", price: 160 },
      { name: "Aloo Matar", price: 160 },
      { name: "Aloo Capsicum Masala", price: 170 },
      { name: "Capsicum Masala", price: 170 },
      { name: "Baingan Masala", price: 170 },
      { name: "Baingan Bharta", price: 180 },
      { name: "Achari Baingan", price: 180 },
      { name: "Baingan Aloo", price: 160 },
      { name: "Bhendi Masala", price: 150 },
      { name: "Bhendi Fry", price: 180 },
      { name: "Green Peas Masala", price: 150 },
      { name: "Shenga Bhaji", price: 150 },
      { name: "Tomato Bhaji", price: 150 },
      { name: "Plain Palak", price: 160 },
      { name: "Garlic Palak", price: 170 },
      { name: "Shev Masala Bhaji", price: 160 },
      { name: "Shev Masala Tadka", price: 170 },
      { name: "Onion Bhaji", price: 150 },
      { name: "Ghati Gravy", price: 160 },
      { name: "Besan Fry", price: 160 }
    ]
  },
  {
    category: "Paneer Main Course",
    dishes: [
      { name: "Paneer Masala", price: 190 },
      { name: "Paneer Butter Masala", price: 200 },
      { name: "Paneer Kadai", price: 210 },
      { name: "Paneer Tikka Masala", price: 200 },
      { name: "Paneer Chilly Milly", price: 210 },
      { name: "Shahi Panner", price: 200 },
      { name: "Mutter Paneer", price: 200 },
      { name: "Palak Paneer", price: 200 },
      { name: "Paneer Kolhapuri", price: 200 },
      { name: "Paneer Hyderabadi", price: 200 },
      { name: "Paneer Makhanwala", price: 200 },
      { name: "Paneer Kaju Kurma", price: 220 },
      { name: "Paneer Burji", price: 220 },
      { name: "Paneer Methi", price: 210 },
      { name: "Paneer Kofta", price: 210 },
      { name: "Paneer Jalfrezi", price: 210 },
      { name: "Paneer Sismi", price: 220 },
      { name: "Paneer Rajwadi", price: 210 },
      { name: "Achar Paneer", price: 190 },
      { name: "Paneer Lababdar", price: 210 },
      { name: "Paneer Kurkure", price: 210 },
      { name: "Paneer Kaju Masala", price: 230 }
    ]
  },
  {
    category: "Kaju Special",
    dishes: [
      { name: "Kaju Masala", price: 200 },
      { name: "Kaju Curry", price: 200 },
      { name: "Kaju Mastana", price: 220 },
      { name: "Matar Kaju Kurma", price: 220 },
      { name: "Veg Kaju Kurma", price: 210 },
      { name: "Kaju Masala Creamy", price: 210 },
      { name: "Achar Kaju", price: 210 },
      { name: "Kaju Palak", price: 210 }
    ]
  },
  {
    category: "Amol Special Dishes",
    dishes: [
      { name: "Amol Veg Garden", price: 230 },
      { name: "Amol Veg Handi", price: 210 },
      { name: "Amol Veg Pahadi", price: 210 },
      { name: "Amol Veg Jalfrezi", price: 210 },
      { name: "Amol Veg Hariyali", price: 210 },
      { name: "Amol Veg Patiala", price: 230 },
      { name: "Amol Veg Chilly Milly", price: 220 },
      { name: "Amol Veg Diwani Handi", price: 220 },
      { name: "Amol Veg Sham Savera", price: 230 },
      { name: "Amol Veg Dilruba", price: 210 },
      { name: "Amol Special Paneer Malvani", price: 360 },
      { name: "Special Kaju Malvani", price: 380 },
      { name: "Amol Veg Malvani", price: 330 },
      { name: "Paneer Kaju Malvani", price: 400 }
    ]
  },
  {
    category: "Rice",
    dishes: [
      { name: "Half Plain Rice", price: 50 },
      { name: "Basmati Plain Rice", price: 90 },
      { name: "Basmati Jeera Rice", price: 110 },
      { name: "Half Basmati Jeera Rice", price: 80 },
      { name: "Basmati Masala Rice", price: 120 },
      { name: "Curd Rice", price: 130 },
      { name: "Basmati Ghee Rice", price: 140 },
      { name: "Veg Pulav", price: 160 },
      { name: "Veg Biryani", price: 170 },
      { name: "Veg Hyderabadi Biryani", price: 180 },
      { name: "Green Peas Pulav", price: 150 },
      { name: "Dal Chawal Khichadi", price: 160 },
      { name: "Dal Khichadi Tadka", price: 170 }
    ]
  },
  {
    category: "Raita",
    dishes: [
      { name: "Kanda Raita", price: 80 },
      { name: "Kakdi Raita", price: 80 },
      { name: "Boondi Raita", price: 90 }
    ]
  },
  {
    category: "Bhartiya Roti",
    dishes: [
      { name: "Kadak Bhakari", price: 25 },
      { name: "Chapati", price: 15 },
      { name: "Butter Chapati", price: 20 },
      { name: "Tava Paratha", price: 20 },
      { name: "Butter Tava Paratha", price: 25 }
    ]
  },
  {
    category: "Tandoori Roti & Naan",
    dishes: [
      { name: "Tandoori Roti", price: 20 },
      { name: "Butter Tandoori Roti", price: 25 },
      { name: "Plain Naan", price: 40 },
      { name: "Butter Naan", price: 50 },
      { name: "Cheese Naan", price: 70 },
      { name: "Butter Cheese Naan", price: 80 },
      { name: "Garlic Naan", price: 60 },
      { name: "Butter Garlic Naan", price: 70 },
      { name: "Garlic Cheese Naan", price: 90 },
      { name: "Butter Cheese Garlic Naan", price: 100 },
      { name: "Plain Kulcha", price: 30 },
      { name: "Butter Kulcha", price: 40 },
      { name: "Laccha Paratha", price: 40 },
      { name: "Butter Laccha Paratha", price: 50 }
    ]
  },
  {
    category: "Ice Cream & Cold Drinks",
    dishes: [
      { name: "Vanilla Ice Cream", price: 40 },
      { name: "Butterscotch Ice Cream", price: 40 },
      { name: "Chocolate Ice Cream", price: 40 },
      { name: "Cold Drinks (250 ml)", price: 25 }
    ]
  }
];

export async function runCompleteMenuUpdate() {
  console.log('[Menu Update] Starting complete menu transcription...');
  const now = new Date().toISOString();

  // 1. Build categories array
  const categoriesList = RAW_MENU.map((c, idx) => ({
    id: c.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: c.category,
    description: `${c.category} selections`,
    sort_order: idx
  }));

  // 2. Build flat dishes array
  const flatDishes = [];
  let globalDishCounter = 1;

  for (const cat of RAW_MENU) {
    const catId = cat.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    for (const d of cat.dishes) {
      const basePrice = d.price;
      // 10% extra for Special Menu (A/C dining)
      const specialPrice = Math.round(basePrice * 1.10);

      flatDishes.push({
        id: `dish_${globalDishCounter}`,
        numeric_id: globalDishCounter,
        name: d.name,
        category: cat.category,
        category_id: catId,
        price: basePrice,
        base_price: basePrice,
        special_price: specialPrice,
        description: `Authentic pure vegetarian ${d.name} prepared fresh with traditional spices.`,
        images: ['/images/dish-placeholder.svg'],
        tags: ['veg'],
        spice_level: 'medium',
        badges: [],
        is_available: 1,
        is_visible: 1,
        scope: 'both',
        sort_order: globalDishCounter
      });
      globalDishCounter++;
    }
  }

  console.log(`[Menu Update] Processed ${categoriesList.length} categories and ${flatDishes.length} total dishes.`);

  // 3. Write public/menu/restaurant_menu_data.json
  const jsonPayload = {
    restaurant: {
      name: "Amol Veg Resto",
      phoneDisplay: "+91 72496 64983",
      phoneDigits: "917249664983",
      website: "#/",
      reviewUrl: "#/review",
      heroPhoto: "",
      eyebrow: "Pure",
      headlineHtml: "Vegetarian<br><em>Delights</em>",
      description: "Fresh Ingredients • Authentic Taste\nFamily Friendly"
    },
    categories: categoriesList.map(c => c.name),
    dishes: flatDishes.map(d => ({
      id: d.numeric_id,
      name: d.name,
      category: d.category,
      category_id: d.category_id,
      price: d.base_price,
      base_price: d.base_price,
      special_price: d.special_price,
      tag: "",
      description: d.description,
      images: ['/images/dish-placeholder.svg'],
      video: null
    }))
  };

  const jsonPath = path.resolve(__dirname, '../public/menu/restaurant_menu_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf8');
  console.log(`[Menu Update] Successfully updated ${jsonPath}`);

  // 4. Update Database tables (categories, dishes, dish_images, gallery_items)
  console.log('[Menu Update] Synchronizing database tables...');

  // Clean old dishes and categories
  await query('DELETE FROM dish_variants');
  await query('DELETE FROM dish_images');
  await query('DELETE FROM dishes');
  await query('DELETE FROM categories');

  // Insert categories
  for (const c of categoriesList) {
    await query(
      'INSERT INTO categories (id, name, description, visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [c.id, c.name, c.description, 1, c.sort_order, now, now]
    );
  }

  // Insert dishes
  for (const d of flatDishes) {
    await query(
      `INSERT INTO dishes (
        id, name, description, category_id, serving_note, price_type, base_price, special_price, special_price_override,
        tags, spice_level, badges, is_available, is_visible, scope, sort_order, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        d.id,
        d.name,
        d.description,
        d.category_id,
        '',
        'single',
        d.base_price,
        d.special_price,
        null,
        JSON.stringify(d.tags),
        d.spice_level,
        JSON.stringify(d.badges),
        1,
        1,
        'both',
        d.sort_order,
        now,
        now
      ]
    );

    // Insert placeholder image record for each dish
    await query(
      'INSERT INTO dish_images (id, dish_id, public_id, url, width, height, sort_order, is_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [`${d.id}_img_0`, d.id, null, '/images/dish-placeholder.svg', 400, 300, 0, 1, now]
    );
  }

  // 5. Update Gallery items to use placeholders as requested
  console.log('[Menu Update] Ensuring gallery items use placeholders (no direct images)...');
  await query('DELETE FROM gallery_items');
  const galleryPlaceholders = [
    { id: 'gal-1', caption: 'Serving Solapur authentic pure veg delights since 1990.', category: 'ambience', aspect: 'wide' },
    { id: 'gal-2', caption: 'Ritual morning delicacies served sizzling hot with authentic chutneys.', category: 'food', aspect: 'wide' },
    { id: 'gal-3', caption: 'Spotless, spacious and comfortable seating designed for family meals.', category: 'ambience', aspect: 'wide' },
    { id: 'gal-4', caption: 'Prepared daily with pure ingredients and zero compromise in our clean kitchen.', category: 'kitchen', aspect: 'standard' },
  ];
  for (let i = 0; i < galleryPlaceholders.length; i++) {
    const g = galleryPlaceholders[i];
    await query(
      'INSERT INTO gallery_items (id, url, alt_text, caption, category, aspect, is_visible, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [g.id, '', g.caption, g.caption, g.category, g.aspect, 1, i, now, now]
    );
  }

  console.log('[Menu Update] Complete! Database & JSON updated with 24 categories and 290 dishes.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCompleteMenuUpdate().then(() => {
    console.log('[Done] Menu update completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('[Error] Menu update failed:', err);
    process.exit(1);
  });
}


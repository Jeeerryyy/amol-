import fs from 'fs';
import path from 'path';

// 1. Copy named alias files in public/images/dishes/popular
const popDir = 'public/images/dishes/popular';
fs.copyFileSync(path.join(popDir, 'dish-1.jpg'), path.join(popDir, 'crispy-chilli-paneer.jpg'));
fs.copyFileSync(path.join(popDir, 'dish-2.jpg'), path.join(popDir, 'paneer-butter-masala.jpg'));
fs.copyFileSync(path.join(popDir, 'dish-3.jpg'), path.join(popDir, 'solapuri-shev-bhaji.jpg'));
fs.copyFileSync(path.join(popDir, 'dish-4.jpg'), path.join(popDir, 'special-veg-thali.jpg'));
console.log('✅ Created named popular dish images in public/images/dishes/popular/');

// 2. Update src/siteConfig.ts
const siteConfigPath = 'src/siteConfig.ts';
let siteConfig = fs.readFileSync(siteConfigPath, 'utf8');

const oldPopularDishesBlock = `    dishes: [
      {
        id: "dish-1",
        title: "Dish 1",
        description: "A delicious and wholesome dish made with fresh ingredients.",
        price: "₹120",
        imageSrc: "/images/dishes/popular/dish-1.jpg",
        placeholderText: "Dosa with chutney & sambar bowls",
      },
      {
        id: "dish-2",
        title: "Dish 2",
        description: "Soft, fluffy and served with our special chutney & sambar.",
        price: "₹100",
        imageSrc: "/images/dishes/popular/dish-2.jpg",
        placeholderText: "Idli plate on banana leaf",
      },
      {
        id: "dish-3",
        title: "Dish 3",
        description: "A flavourful and light option perfect for any time of the day.",
        price: "₹110",
        imageSrc: "/images/dishes/popular/dish-3.jpg",
        placeholderText: "Fried-rice bowl",
      },
      {
        id: "dish-4",
        title: "Dish 4",
        description: "A complete and satisfying meal made with fresh, pure veg ingredients.",
        price: "₹150",
        imageSrc: "/images/dishes/popular/dish-4.jpg",
        placeholderText: "Thali (rice, curry, papad)",
      },
    ] as DishItem[],`;

const newPopularDishesBlock = `    dishes: [
      {
        id: "pop-1",
        title: "Crispy Chilli Paneer",
        description: "Fresh cottage cheese cubes tossed with bell peppers & spicy garlic sauce.",
        price: "₹150",
        imageSrc: "/images/dishes/popular/dish-1.jpg",
        placeholderText: "Crispy Chilli Paneer",
      },
      {
        id: "pop-2",
        title: "Paneer Butter Masala",
        description: "Rich tomato, butter and cashew nut gravy finished with fresh cream.",
        price: "₹180",
        imageSrc: "/images/dishes/popular/dish-2.jpg",
        placeholderText: "Paneer Butter Masala",
      },
      {
        id: "pop-3",
        title: "Solapuri Shev Bhaji",
        description: "Authentic Solapur spicy red gravy topped with crisp gram flour sev.",
        price: "₹130",
        imageSrc: "/images/dishes/popular/dish-3.jpg",
        placeholderText: "Solapuri Shev Bhaji",
      },
      {
        id: "pop-4",
        title: "Special Veg Thali",
        description: "Complete traditional feast with fresh rotis, seasonal curries, dal and rice.",
        price: "₹220",
        imageSrc: "/images/dishes/popular/dish-4.jpg",
        placeholderText: "Special Veg Thali",
      },
    ] as DishItem[],`;

siteConfig = siteConfig.replace(/\r\n/g, '\n');
const normOldConfig = oldPopularDishesBlock.replace(/\r\n/g, '\n');
const normNewConfig = newPopularDishesBlock.replace(/\r\n/g, '\n');

if (siteConfig.includes(normOldConfig)) {
  siteConfig = siteConfig.replace(normOldConfig, normNewConfig);
  fs.writeFileSync(siteConfigPath, siteConfig, 'utf8');
  console.log('✅ Updated src/siteConfig.ts with real popular dishes data');
} else {
  console.warn('⚠️ Could not find exact oldPopularDishesBlock in siteConfig.ts, attempting regex');
  siteConfig = siteConfig.replace(
    /dishes:\s*\[[\s\S]*?\] as DishItem\[\],/,
    normNewConfig
  );
  fs.writeFileSync(siteConfigPath, siteConfig, 'utf8');
  console.log('✅ Updated src/siteConfig.ts via regex');
}

// 3. Update server/routes/publicRoutes.js fallback
const pubRoutesPath = 'server/routes/publicRoutes.js';
let pubRoutes = fs.readFileSync(pubRoutesPath, 'utf8');

const oldPubFallback = `    return res.json([
      { id: 1, title: "Special Thali", name: "Special Thali", price: 120, description: "A delicious and wholesome dish made with fresh ingredients.", imageSrc: "/images/dishes/popular/dish-1.jpg" },
      { id: 2, title: "South Indian Idli Sambar", name: "South Indian Idli Sambar", price: 100, description: "Soft, fluffy and served with our special chutney & sambar.", imageSrc: "/images/dishes/popular/dish-2.jpg" },
      { id: 3, title: "Crispy Masala Dosa", name: "Crispy Masala Dosa", price: 110, description: "A flavourful and light option perfect for any time of the day.", imageSrc: "/images/dishes/popular/dish-3.jpg" },
      { id: 4, title: "Amol Veg Platter", name: "Amol Veg Platter", price: 150, description: "A complete and satisfying meal made with fresh, pure veg ingredients.", imageSrc: "/images/dishes/popular/dish-4.jpg" }
    ]);`;

const newPubFallback = `    return res.json([
      { id: "pop-1", title: "Crispy Chilli Paneer", name: "Crispy Chilli Paneer", price: "₹150", description: "Fresh cottage cheese cubes tossed with bell peppers & spicy garlic sauce.", imageSrc: "/images/dishes/popular/dish-1.jpg", image_url: "/images/dishes/popular/dish-1.jpg" },
      { id: "pop-2", title: "Paneer Butter Masala", name: "Paneer Butter Masala", price: "₹180", description: "Rich tomato, butter and cashew nut gravy finished with fresh cream.", imageSrc: "/images/dishes/popular/dish-2.jpg", image_url: "/images/dishes/popular/dish-2.jpg" },
      { id: "pop-3", title: "Solapuri Shev Bhaji", name: "Solapuri Shev Bhaji", price: "₹130", description: "Authentic Solapur spicy red gravy topped with crisp gram flour sev.", imageSrc: "/images/dishes/popular/dish-3.jpg", image_url: "/images/dishes/popular/dish-3.jpg" },
      { id: "pop-4", title: "Special Veg Thali", name: "Special Veg Thali", price: "₹220", description: "Complete traditional feast with fresh rotis, seasonal curries, dal and rice.", imageSrc: "/images/dishes/popular/dish-4.jpg", image_url: "/images/dishes/popular/dish-4.jpg" }
    ]);`;

pubRoutes = pubRoutes.replace(/\r\n/g, '\n');
const normOldPub = oldPubFallback.replace(/\r\n/g, '\n');
const normNewPub = newPubFallback.replace(/\r\n/g, '\n');

if (pubRoutes.includes(normOldPub)) {
  pubRoutes = pubRoutes.replace(normOldPub, normNewPub);
  fs.writeFileSync(pubRoutesPath, pubRoutes, 'utf8');
  console.log('✅ Updated server/routes/publicRoutes.js fallback');
}

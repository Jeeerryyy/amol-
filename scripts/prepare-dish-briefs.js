import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine vessel and physical composition based on dish name and category
function getDishComposition(dishName, category) {
  const name = dishName.toLowerCase();
  const cat = category.toLowerCase();

  let vessel = 'plate'; // 'plate' | 'bowl' | 'glass'
  let composition = '';
  let colors = [];

  // Sandwiches
  if (cat.includes('sandwich')) {
    vessel = 'plate';
    if (name.includes('cheese') && name.includes('corn')) {
      composition = 'golden toasted sandwich cut diagonally showing melted cheese and sweet golden corn kernels';
      colors = ['golden-brown', 'yellow', 'white'];
    } else if (name.includes('paneer') || name.includes('tikka')) {
      composition = 'golden toasted sandwich cut into halves showing spiced paneer cubes, chopped peppers and melted cheese';
      colors = ['golden-brown', 'orange', 'green'];
    } else if (name.includes('bombay')) {
      composition = 'classic triple-decker toasted sandwich layered with sliced cucumber, tomato, beetroot, potato, green mint chutney and cheese';
      colors = ['golden-brown', 'red', 'green', 'purple'];
    } else if (name.includes('peri peri')) {
      composition = 'grilled sandwich with reddish peri peri spice dusted crust, filled with vegetables and melted cheese';
      colors = ['golden-red', 'white', 'green'];
    } else if (name.includes('mayo')) {
      composition = 'grilled white bread sandwich filled with creamy vegetable mayonnaise spread, shredded cabbage and carrots';
      colors = ['golden-brown', 'creamy-white', 'orange'];
    } else {
      composition = 'toasted triangle grilled bread slices with distinct diagonal grill marks, filled with sliced tomato, cucumber and potato';
      colors = ['golden-brown', 'red', 'green'];
    }
  }
  // Pizza
  else if (cat.includes('pizza')) {
    vessel = 'plate';
    if (name.includes('margherita')) {
      composition = 'round thin-crust pizza baked golden with rich red tomato sauce base, melted bubbly mozzarella cheese and fresh basil leaf';
      colors = ['golden-crust', 'red', 'creamy-white', 'green'];
    } else if (name.includes('sweetcorn')) {
      composition = 'golden baked pizza generously topped with sweet yellow corn kernels and melted stringy mozzarella cheese';
      colors = ['golden', 'yellow', 'white'];
    } else if (name.includes('farm house') || name.includes('veg crunch') || name.includes('spicy') || name.includes('crowded')) {
      composition = 'artisan round pizza loaded with colorful diced bell peppers, sweetcorn, sliced black olives, red onions and melted cheese';
      colors = ['golden-crust', 'green', 'yellow', 'red', 'black'];
    } else if (name.includes('peri peri')) {
      composition = 'baked pizza seasoned with fiery red peri-peri spice dust, bell peppers, onions and molten cheese';
      colors = ['golden', 'red', 'orange', 'white'];
    } else {
      composition = 'cheesy baked pizza topped with assorted fresh vegetables and golden browned cheese spots';
      colors = ['golden', 'white', 'red'];
    }
  }
  // Fries
  else if (cat.includes('fries')) {
    vessel = 'plate';
    if (name.includes('peri peri')) {
      composition = 'tall stack of crispy golden potato french fries dusted evenly with vibrant red peri-peri seasoning';
      colors = ['golden-yellow', 'vibrant-red'];
    } else if (name.includes('masala')) {
      composition = 'crispy golden hand-cut potato fries tossed in aromatic tangy Indian chaat masala spices';
      colors = ['golden-yellow', 'warm-brown'];
    } else {
      composition = 'crisp golden potato french fries with glistening rock salt crystals, fluffy interior';
      colors = ['golden-yellow', 'white-salt'];
    }
  }
  // Burger
  else if (cat.includes('burger')) {
    vessel = 'plate';
    if (name.includes('paneer')) {
      composition = 'soft toasted sesame seed burger bun sandwiching a crispy paneer patty, melted cheese slice, crisp lettuce, tomato and creamy sauce';
      colors = ['golden-bun', 'golden-patty', 'green-lettuce', 'red-tomato'];
    } else if (name.includes('double cheese')) {
      composition = 'toasted burger bun layered with two golden vegetable patties, double melted cheddar cheese slices, lettuce and tomato';
      colors = ['golden-brown', 'yellow-cheese', 'green'];
    } else {
      composition = 'toasted burger bun with a crispy spiced vegetable patty, fresh lettuce leaf, onion rings, tomato slice and sauce';
      colors = ['golden-brown', 'fresh-green', 'red'];
    }
  }
  // Cold Coffee & Drinks
  else if (cat.includes('coffee')) {
    vessel = 'glass';
    if (name.includes('ice cream')) {
      composition = 'frothy creamy chilled iced cold coffee served in a tall clear glass topped with a generous scoop of vanilla ice cream and chocolate drizzle';
      colors = ['coffee-brown', 'vanilla-white', 'dark-chocolate'];
    } else if (name.includes('choco')) {
      composition = 'rich chilled chocolate cold coffee with thick foam top, chocolate crunchies and fudge drizzle';
      colors = ['mocha-brown', 'deep-chocolate'];
    } else {
      composition = 'chilled frothy cold coffee with velvety micro-foam head served in a clear glass on the plate';
      colors = ['rich-tan', 'creamy-foam'];
    }
  }
  // Milk Shake
  else if (cat.includes('shake')) {
    vessel = 'glass';
    if (name.includes('oreo')) {
      composition = 'thick creamy cookies and cream milkshake with dark crushed Oreo cookie crumbs, topped with whipped cream and an Oreo biscuit';
      colors = ['cream-white', 'dark-cookie-black'];
    } else if (name.includes('strawberry')) {
      composition = 'thick pastel pink strawberry milkshake garnished with whipped cream and strawberry syrup';
      colors = ['pastel-pink', 'white'];
    } else if (name.includes('chocolate') || name.includes('kit kat')) {
      composition = 'thick velvety chocolate milkshake with chocolate syrup swirl and chocolate wafer sticks';
      colors = ['deep-brown', 'chocolate'];
    } else if (name.includes('rose')) {
      composition = 'vibrant light pink chilled rose milkshake infused with fragrant rose syrup and dried rose petals';
      colors = ['soft-pink', 'ruby-red'];
    } else if (name.includes('brownie')) {
      composition = 'thick decadent chocolate brownie milkshake topped with fudgy brownie chunks and dark chocolate sauce';
      colors = ['dark-brown', 'fudge'];
    } else {
      composition = 'thick creamy chilled milkshake served in a tall glass centered on the plate';
      colors = ['creamy-yellow', 'white'];
    }
  }
  // Brownie
  else if (cat.includes('brownie')) {
    vessel = 'plate';
    composition = 'warm dense square chocolate fudge brownie topped with a cold white scoop of vanilla ice cream and warm glossy chocolate fudge sauce';
    colors = ['dark-chocolate', 'creamy-white'];
  }
  // Papad & Salads
  else if (name.includes('papad')) {
    vessel = 'plate';
    if (name.includes('masala') || name.includes('cheese')) {
      composition = 'crisp large circular papad topped with finely diced red tomatoes, onions, green chillies, coriander and grated cheese';
      colors = ['golden-papad', 'red', 'green', 'white'];
    } else if (name.includes('fry')) {
      composition = 'crisp golden deep-fried circular papad with blistered texture';
      colors = ['golden-amber'];
    } else {
      composition = 'crisp circular dry roasted papad with charred aromatic spots';
      colors = ['pale-buff', 'char-spots'];
    }
  }
  else if (name.includes('salad')) {
    vessel = 'plate';
    if (name.includes('tomato')) {
      composition = 'neatly arranged overlapping concentric slices of ripe red farm tomatoes with fresh coriander leaf garnish and lemon wedge';
      colors = ['vibrant-red', 'bright-green'];
    } else if (name.includes('kakdi') || name.includes('cucumber')) {
      composition = 'crisp thin peeled cucumber rounds arranged fan-style on the plate with fresh mint and lemon slice';
      colors = ['pale-green', 'white'];
    } else {
      composition = 'fresh garden salad platter with sliced cucumbers, ripe tomatoes, carrots, beetroot and green chilli with lemon wedges';
      colors = ['green', 'red', 'orange', 'deep-purple'];
    }
  }
  // Starters & Pakodas & Tikkis
  else if (cat.includes('starter') && !cat.includes('paneer') && !cat.includes('tandoori')) {
    vessel = 'plate';
    if (name.includes('paratha')) {
      composition = 'golden-brown griddled flatbread stuffed with spiced filling, garnished with a pat of white melting butter';
      colors = ['golden-brown', 'melting-white'];
    } else if (name.includes('pakoda')) {
      composition = 'golden-fried crispy gram-flour batter fritters with delicate lacy edges, dusted with chaat masala';
      colors = ['golden-yellow', 'warm-amber'];
    } else if (name.includes('tikki') || name.includes('kabab')) {
      composition = 'pan-seared shallow-fried round vegetable patties with golden crust and tender interior, garnished with fresh microgreens';
      colors = ['golden-crust', 'herb-green'];
    } else {
      composition = 'freshly prepared vegetarian starter arranged neatly on the ceramic plate with fresh herb garnish';
      colors = ['golden', 'green'];
    }
  }
  // Paneer Starters
  else if (cat.includes('paneer starters')) {
    vessel = 'plate';
    if (name.includes('chilly') || name.includes('chilli')) {
      composition = 'crisp batter-fried fresh cottage cheese cubes tossed with glossy dark soy sauce, sliced green bell peppers, red onions and spring onions';
      colors = ['golden-paneer', 'dark-glaze', 'vibrant-green', 'purple-onion'];
    } else if (name.includes('65')) {
      composition = 'deep-fried spiced paneer cubes in a fiery red South Indian batter with curry leaves and green chillies';
      colors = ['crimson-red', 'deep-green'];
    } else if (name.includes('crispy') || name.includes('thread') || name.includes('finger')) {
      composition = 'golden crispy shredded vermicelli or batter-coated paneer fingers fried until shatteringly crisp';
      colors = ['golden-yellow', 'pure-white-interior'];
    } else if (name.includes('satay')) {
      composition = 'grilled skewers of marinated paneer cubes drizzled with rich nutty satay sauce and toasted sesame seeds';
      colors = ['golden-seared', 'rich-peanut-tan', 'toasted-sesame'];
    } else {
      composition = 'succulent cottage cheese cubes tossed in rich savory sauce with aromatics and scallions';
      colors = ['golden-brown', 'rich-sauce', 'green'];
    }
  }
  // Chinese
  else if (cat === 'chinese') {
    vessel = 'plate';
    if (name.includes('manchurian')) {
      composition = 'golden-fried minced vegetable dumplings tossed in an aromatic dark soya, garlic, ginger and scallion glaze';
      colors = ['deep-brown', 'green-scallion'];
    } else if (name.includes('crispy') || name.includes('finger') || name.includes('65')) {
      composition = 'batter-fried crispy vegetables tossed with mild chili garlic seasoning and curry leaves';
      colors = ['golden-amber', 'glossy-red'];
    } else if (name.includes('spring roll')) {
      composition = 'golden-brown crispy fried spring rolls sliced diagonally, showing shredded cabbage and carrot vegetable filling';
      colors = ['golden-pastry', 'green-cabbage', 'orange-carrot'];
    } else if (name.includes('lolly pop')) {
      composition = 'crispy batter-fried vegetable lollipop appetizers with crunchy exterior and red glaze';
      colors = ['crisp-golden', 'red-chili'];
    } else if (name.includes('sizzler')) {
      composition = 'sizzling platter of stir-fried noodles, vegetable patty, crispy fries, and sauteed vegetables';
      colors = ['golden', 'brown', 'colorful-vegetables'];
    } else {
      composition = 'stir-fried wok-tossed vegetables in savory glaze with scallions and sesame';
      colors = ['vibrant-vegetable', 'dark-glaze'];
    }
  }
  // Tandoori Starters
  else if (cat.includes('tandoori starters')) {
    vessel = 'plate';
    if (name.includes('tikka') && name.includes('paneer')) {
      composition = 'charcoal-grilled cottage cheese cubes with charred edges marinated in spiced yogurt and turmeric, served with bell pepper and onion petals';
      colors = ['spiced-orange', 'char-black', 'white-core', 'green-pepper'];
    } else if (name.includes('hariyali') || name.includes('pahadi')) {
      composition = 'charcoal-grilled paneer or vegetable skewers marinated in vibrant green mint, coriander and spinach paste';
      colors = ['deep-emerald-green', 'char-spots'];
    } else if (name.includes('platter')) {
      composition = 'generous assortment of grilled tandoori paneer tikka, tandoori baby corn, mushroom and vegetable kebabs with charred edges';
      colors = ['orange-tikka', 'green-hariyali', 'golden-mushroom'];
    } else {
      composition = 'charcoal-grilled skewered vegetables with aromatic tandoori marinade and light smoky char';
      colors = ['spiced-amber', 'charred-edges'];
    }
  }
  // Soups
  else if (cat.includes('soup')) {
    vessel = 'bowl';
    if (name.includes('manchow')) {
      composition = 'steaming dark brown vegetable soup flavored with soy, ginger and garlic, topped with a mound of crispy golden fried noodles and fresh scallions';
      colors = ['dark-brown', 'golden-crispy-noodles', 'green-scallion'];
    } else if (name.includes('tomato')) {
      composition = 'silky smooth bright crimson-red tomato soup garnished with a swirl of fresh white cream and golden croutons';
      colors = ['rich-red', 'swirled-white-cream', 'golden-croutons'];
    } else if (name.includes('spinach')) {
      composition = 'creamy emerald-green spinach soup finished with velvety cream drizzle';
      colors = ['emerald-green', 'white-cream'];
    } else if (name.includes('mushroom')) {
      composition = 'creamy warm earthy mushroom soup with sliced sautéed button mushroom garnish and cracked black pepper';
      colors = ['creamy-taupe', 'brown-mushroom'];
    } else if (name.includes('lemon coriander')) {
      composition = 'light fragrant clear broth soup with finely minced vegetables, fresh green coriander leaves and a squeeze of yellow lemon';
      colors = ['clear-golden', 'fresh-green'];
    } else {
      composition = 'steaming hot savory vegetable broth soup with diced fresh vegetables and herbs';
      colors = ['warm-broth', 'green-herbs'];
    }
  }
  // Chinese Rice & Noodles
  else if (cat.includes('chinese rice') || cat.includes('noodles')) {
    vessel = 'plate';
    if (name.includes('noodle')) {
      composition = 'wok-tossed long thin Hakka noodles with julienned cabbage, bell peppers, carrots, spring onions and savory soya glaze';
      colors = ['golden-tan-noodles', 'green-capsicum', 'orange-carrot'];
    } else if (name.includes('triple')) {
      composition = 'combination of stir-fried rice and crispy noodles topped with savory vegetable Manchurian gravy and spring onions';
      colors = ['fried-rice-golden', 'crispy-noodles', 'dark-gravy'];
    } else if (name.includes('schezwan') || name.includes('shezwan')) {
      composition = 'wok-tossed fragrant basmati fried rice stained vibrant red-orange with spicy Schezwan chili paste, finely chopped vegetables';
      colors = ['fiery-red-orange', 'green-spring-onion'];
    } else {
      composition = 'fluffy long-grain wok-fried basmati rice tossed with finely diced colorful vegetables, scallions and aromatic light soy seasoning';
      colors = ['golden-white-rice', 'green-peas', 'orange-carrot'];
    }
  }
  // Main Course, Punjabi, Paneer Main Course, Kaju, Amol Special (Curries & Gravies)
  else if (
    cat.includes('main course') ||
    cat.includes('punjabi') ||
    cat.includes('paneer main') ||
    cat.includes('kaju') ||
    cat.includes('amol special')
  ) {
    // Liquid dals and curries served in stone-grey bowl centered on the plate
    vessel = 'bowl';
    if (name.includes('dal')) {
      if (name.includes('tadka') || name.includes('tadaka')) {
        composition = 'golden yellow slow-cooked toor dal topped with aromatic sizzling red ghee tadka of whole red chillies, cumin seeds, garlic and fresh cilantro';
        colors = ['golden-yellow', 'red-chilli', 'brown-cumin', 'green-cilantro'];
      } else if (name.includes('makh')) {
        composition = 'rich creamy slow-cooked black lentils and kidney beans simmered with butter and tomato purée, finished with a cream swirl';
        colors = ['deep-brown-black', 'white-cream', 'golden-butter'];
      } else {
        composition = 'homestyle yellow lentil curry tempered with mustard, cumin and fresh coriander';
        colors = ['golden-yellow', 'green'];
      }
    } else if (name.includes('palak') || name.includes('saag')) {
      composition = 'rich silky vibrant green puréed spinach gravy with cottage cheese or potato cubes, garnished with a swirl of cream and ginger juliennes';
      colors = ['emerald-green', 'white-paneer', 'cream'];
    } else if (name.includes('kaju')) {
      composition = 'luxurious rich cashew nut curry with golden roasted whole cashews nestled in an aromatic spiced onion-tomato-cashew gravy';
      colors = ['warm-golden-orange', 'creamy-whole-cashews', 'green-coriander'];
    } else if (name.includes('paneer') && (name.includes('butter') || name.includes('makhani'))) {
      composition = 'tender fresh cottage cheese cubes in a smooth velvety bright orange-red tomato and cashew butter gravy, topped with melting white butter and cream';
      colors = ['velvety-orange-red', 'pure-white-paneer', 'fresh-cream'];
    } else if (name.includes('kadai') || name.includes('karahi')) {
      composition = 'cottage cheese cubes and crunchy chunks of green bell pepper and onion in a robust, semi-dry spiced tomato gravy with crushed coriander seeds';
      colors = ['rich-red-brown', 'green-capsicum', 'onion-purple'];
    } else if (name.includes('kolhapuri')) {
      composition = 'spicy vibrant red traditional Kolhapuri style gravy packed with vegetables, fiery red chili oil surface and fresh coriander';
      colors = ['fiery-crimson-red', 'fresh-green'];
    } else if (name.includes('kofta')) {
      composition = 'golden-fried delicate vegetable or paneer kofta dumplings resting in a rich, creamy mildly sweet golden-orange cashew gravy';
      colors = ['golden-orange-gravy', 'golden-kofta', 'white-cream'];
    } else if (name.includes('handi') || name.includes('bhuna') || name.includes('maratha')) {
      composition = 'thick hearty mixed vegetable curry slow-simmered in a dark spiced onion-tomato gravy, garnished with ginger juliennes and fresh cilantro';
      colors = ['deep-reddish-brown', 'green-cilantro', 'yellow-ginger'];
    } else if (name.includes('aloo') || name.includes('jeera') || name.includes('gobi') || name.includes('bhendi')) {
      vessel = 'plate'; // Dry sabzis served directly on plate
      composition = 'homestyle dry-roasted spiced vegetables tossed with cumin seeds, turmeric and fresh green herbs';
      colors = ['golden-yellow', 'warm-brown', 'fresh-green'];
    } else {
      composition = 'rich aromatic vegetarian curry simmered in authentic Indian spices, finished with fresh herb garnish';
      colors = ['rich-golden-red', 'fresh-coriander'];
    }
  }
  // Rice
  else if (cat === 'rice') {
    vessel = 'bowl';
    if (name.includes('biryani') || name.includes('pulav')) {
      composition = 'fragrant long-grain basmati rice layered with colorful spiced vegetables, whole spices, fried golden onions (birista) and saffron strands';
      colors = ['golden-saffron-rice', 'white-basmati', 'green-peas', 'orange-carrot', 'crispy-brown-onions'];
    } else if (name.includes('jeera')) {
      composition = 'steamed fluffy white basmati rice tossed with fragrant roasted brown cumin seeds and a touch of golden ghee';
      colors = ['pearly-white', 'dark-brown-cumin', 'glistening-ghee'];
    } else if (name.includes('khich')) {
      composition = 'wholesome comforting porridge of yellow lentils and rice tempered with cumin seeds and pure golden ghee';
      colors = ['golden-yellow', 'herb-green'];
    } else if (name.includes('curd')) {
      composition = 'cooling South Indian tempered yogurt rice with mustard seeds, curry leaves, ginger and pomegranate seeds';
      colors = ['creamy-white', 'ruby-pomegranate', 'green-curry-leaf'];
    } else {
      composition = 'steamed fluffy long-grain basmati rice with perfectly separated tender grains';
      colors = ['pristine-white'];
    }
  }
  // Raita
  else if (cat.includes('raita')) {
    vessel = 'bowl';
    if (name.includes('boondi')) {
      composition = 'chilled whisked creamy yogurt raita topped with crispy golden fried gram-flour boondi pearls, roasted cumin powder and red chili dust';
      colors = ['creamy-white', 'golden-boondi', 'brown-cumin'];
    } else if (name.includes('kakdi') || name.includes('kanda')) {
      composition = 'cooling whisked spiced curd raita blended with finely diced fresh cucumbers or crunchy pink onions, garnished with fresh cilantro';
      colors = ['creamy-white', 'green-cucumber', 'pink-onion'];
    } else {
      composition = 'whisked cooling spiced yogurt raita with roasted cumin powder dusting';
      colors = ['creamy-white', 'cumin-dust'];
    }
  }
  // Breads / Roti / Naan
  else if (cat.includes('roti') || cat.includes('naan') || cat.includes('bhartiya')) {
    vessel = 'plate';
    if (name.includes('naan')) {
      if (name.includes('garlic')) {
        composition = 'tear-drop shaped tandoori naan flatbread with blistered golden charred bubbles, brushed generously with melted butter and studded with minced golden roasted garlic and cilantro';
        colors = ['golden-tan-crust', 'char-bubbles', 'golden-garlic', 'green-cilantro'];
      } else if (name.includes('cheese')) {
        composition = 'soft fluffy tandoori naan stuffed with melted stringy cheese, golden blistered surface brushed with butter';
        colors = ['golden-crust', 'white-cheese', 'glistening-butter'];
      } else {
        composition = 'classic tear-drop shaped leavened tandoori naan with golden brown charred blister pockets, glistening with melted butter';
        colors = ['golden-tan', 'char-spots', 'melted-butter'];
      }
    } else if (name.includes('paratha')) {
      composition = 'multi-layered flaky spiral laccha paratha with crisp golden-brown folds, brushed with warm ghee';
      colors = ['golden-brown-layers', 'glistening-ghee'];
    } else if (name.includes('bhakari') || name.includes('bhakri')) {
      composition = 'traditional rustic Maharashtrian jowar or bajra flatbread roasted on tava with authentic toasted surface';
      colors = ['rustic-pale-buff', 'toasted-brown-spots'];
    } else {
      composition = 'hot whole-wheat tandoori roti with soft center and crispy blistered edges, brushed lightly with butter';
      colors = ['golden-whole-wheat', 'charred-blisters'];
    }
  }
  // Ice cream & cold drinks
  else if (cat.includes('ice cream') || cat.includes('cold drink')) {
    if (name.includes('cold drink')) {
      vessel = 'glass';
      composition = 'effervescent dark or citrus cold soft drink in a clear glass with floating ice cubes and effervescent bubbles';
      colors = ['amber-dark', 'clear-ice'];
    } else {
      vessel = 'bowl';
      if (name.includes('chocolate')) {
        composition = 'two perfect round scoops of rich dark chocolate ice cream garnished with dark chocolate shavings';
        colors = ['deep-chocolate-brown'];
      } else if (name.includes('butterscotch')) {
        composition = 'two round scoops of creamy golden butterscotch ice cream studded with crunchy praline toffee bits';
        colors = ['creamy-golden-yellow', 'amber-praline'];
      } else {
        composition = 'two smooth scoops of classic pure vanilla bean ice cream with delicate specks of real vanilla';
        colors = ['pure-creamy-ivory'];
      }
    }
  }
  // Fallback
  else {
    vessel = 'plate';
    composition = 'authentic Indian vegetarian delicacy prepared fresh with traditional spices and herbs';
    colors = ['golden', 'warm-tones'];
  }

  return { vessel, composition, colors };
}

async function prepareBriefsAndManifests() {
  console.log('[Audit] Querying all menu dishes from database...');
  const dishes = await query('SELECT * FROM dishes ORDER BY sort_order ASC');
  const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  console.log(`[Audit] Total dishes found in DB: ${dishes.length}`);

  const briefs = [];
  const rollbackManifest = {};
  const manifest = {};

  for (const d of dishes) {
    const catName = catMap.get(d.category_id) || d.category_id;
    const { vessel, composition, colors } = getDishComposition(d.name, catName);

    // Rollback backup
    const currentImgs = await query('SELECT url, public_id FROM dish_images WHERE dish_id = $1 ORDER BY sort_order ASC', [d.id]);
    rollbackManifest[d.id] = {
      name: d.name,
      category: catName,
      images: currentImgs.map(img => ({ url: img.url, public_id: img.public_id }))
    };

    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const brief = {
      id: d.id,
      slug: slug,
      name: d.name,
      category: catName,
      category_id: d.category_id,
      base_price: d.base_price,
      special_price: d.special_price,
      menu_description: d.description || '',
      composition: composition,
      vessel_type: vessel,
      key_colors: colors,
      angles: [
        {
          index: 1,
          type: 'cover',
          angle_desc: 'camera at a 45-degree elevation, front three-quarter view',
          filename: `${slug}-01-angle45.jpg`
        },
        {
          index: 2,
          type: 'top_down',
          angle_desc: 'camera directly overhead at 90 degrees, perfectly top-down flat lay',
          filename: `${slug}-02-top.jpg`
        }
      ]
    };

    briefs.push(brief);

    manifest[d.id] = {
      slug: slug,
      name: d.name,
      category: catName,
      image1: {
        filename: `${slug}-01-angle45.jpg`,
        status: 'pending',
        attempts: 0,
        flags: []
      },
      image2: {
        filename: `${slug}-02-top.jpg`,
        status: 'pending',
        attempts: 0,
        flags: []
      }
    };
  }

  // Write dish-briefs.json
  const briefsPath = path.resolve(__dirname, '../dish-briefs.json');
  fs.writeFileSync(briefsPath, JSON.stringify(briefs, null, 2), 'utf8');
  console.log(`[Audit] Saved dish-briefs.json with ${briefs.length} briefs to ${briefsPath}`);

  // Write rollback-manifest.json
  const rollbackPath = path.resolve(__dirname, '../rollback-manifest.json');
  fs.writeFileSync(rollbackPath, JSON.stringify(rollbackManifest, null, 2), 'utf8');
  console.log(`[Audit] Saved rollback-manifest.json to ${rollbackPath}`);

  // Write manifest.json
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[Audit] Saved manifest.json to ${manifestPath}`);

  return { briefsCount: briefs.length };
}

prepareBriefsAndManifests().then((res) => {
  console.log('[Audit] Step 1 Audit complete:', res);
  process.exit(0);
}).catch(err => {
  console.error('[Audit Error]', err);
  process.exit(1);
});


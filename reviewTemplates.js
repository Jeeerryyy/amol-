/**
 * Instant Local Draft Generator (0 ms, 100% offline fallback)
 * Generates natural customer reviews based purely on selected stars and options.
 */

// Simple deterministic PRNG based on a numeric seed
function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickWithSeed(array, seed, offset = 0) {
  if (!array || array.length === 0) return '';
  const idx = Math.floor(pseudoRandom(seed + offset) * array.length);
  return array[idx % array.length];
}

export const PHRASE_BANK = {
  // ---------------------------------------------------------------------------
  // POSITIVE BAND (Stars 4 - 5)
  // ---------------------------------------------------------------------------
  positive: {
    openers: [
      "Had a really pleasant visit to Amol Veg Resto.",
      "Visited Amol Veg Resto and had a genuinely good experience.",
      "Really enjoyed our meal here.",
      "Had a wonderful dining experience at this place.",
      "Stopped by for lunch and was thoroughly satisfied.",
      "Our visit here was very satisfying.",
      "Glad we decided to dine at Amol Veg Resto today.",
    ],
    closers: [
      "Definitely planning to visit again soon.",
      "Would gladly recommend this place to others.",
      "A great spot in Sakhar Peth that we will revisit.",
      "Will certainly be returning with family.",
      "Overall, very happy with the experience.",
      "Truly appreciated the meal and the service.",
      "Looking forward to coming back next time.",
    ],
    connectors: [
      "Also,",
      "On top of that,",
      "Furthermore,",
      "In addition,",
      "Plus,",
    ],
    generalImpression: [
      "Everything during our visit went smoothly and the overall experience was great.",
      "Had a really good meal and enjoyed the warm hospitality.",
      "Very happy with our visit and the quality provided here.",
      "Thoroughly enjoyed dining here, everything was handled very nicely.",
    ],
    aspects: {
      taste: [
        "The food taste was spot on and full of authentic flavor.",
        "Every dish tasted fresh, aromatic, and well balanced.",
        "The food was genuinely delicious with great traditional taste.",
        "Really loved the authentic taste and preparation of the food.",
      ],
      freshness: [
        "You can tell the ingredients are fresh and cooked to order.",
        "The ingredients felt completely fresh and made with care.",
        "Food was served piping hot with noticeable freshness.",
        "Everything served tasted very fresh and well prepared.",
      ],
      speed: [
        "The service speed was impressively quick even during busy hours.",
        "Our orders arrived quickly without any long wait.",
        "Service was prompt and efficient from start to finish.",
        "Food was brought to our table in good time.",
      ],
      staff: [
        "The staff was courteous, polite, and attentive throughout.",
        "Staff members were very humble and helpful with our order.",
        "Customer service from the staff was warm and respectful.",
        "The team here is attentive and takes good care of guests.",
      ],
      cleanliness: [
        "The dining area and tables were kept spotless and clean.",
        "Cleanliness was well maintained across the restaurant.",
        "Very clean and hygienic atmosphere to dine in.",
        "Appreciated the high standard of hygiene and clean tables.",
      ],
      value: [
        "Pricing is very reasonable for the quality served.",
        "Great value for money with pocket-friendly rates.",
        "Fair prices considering the quality and fresh preparation.",
        "Very economical pricing without compromising on standards.",
      ],
      portions: [
        "Portion sizes were generous and quite filling.",
        "The serving quantity was more than enough for our group.",
        "Good portion sizes that make the meal fully satisfying.",
        "Very adequate serving sizes for every dish ordered.",
      ],
      ambience: [
        "The ambience was calm, comfortable, and neatly arranged.",
        "Seating was spacious, comfortable, and well ventilated.",
        "Pleasant and relaxed dining atmosphere throughout.",
        "The hall arrangement and seating comfort were very nice.",
      ],
      family: [
        "It is a comfortable and family-friendly place to dine.",
        "Great family-friendly dining environment for all age groups.",
        "Very welcoming setup for families having lunch or dinner.",
        "A peaceful setting that works nicely for family meals.",
      ],
      takeaway: [
        "Takeaway packing was neat, secure, and handed over fast.",
        "The parcel service was fast with warm, spill-proof packing.",
        "Takeaway service is prompt and very hygienically packed.",
        "Got our takeaway quickly and the packing kept food warm.",
      ],
      pureveg: [
        "Being a 100% pure vegetarian restaurant gives complete peace of mind.",
        "A reliable pure vegetarian destination with authentic preparation.",
        "Love having a dedicated pure vegetarian kitchen of this quality.",
        "Great pure veg option in Solapur that maintains proper standards.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // NEUTRAL BAND (Star 3)
  // ---------------------------------------------------------------------------
  neutral: {
    openers: [
      "Visited Amol Veg Resto recently.",
      "Had an average overall experience at Amol Veg Resto.",
      "Dined here recently during normal hours.",
      "Our visit here was decent though there is room for improvement.",
      "Stopped by for a quick meal.",
      "Had a fair dining experience here.",
      "The meal was alright overall.",
    ],
    closers: [
      "A decent choice, though some areas could be improved.",
      "An okay visit, hoping for a better experience next time.",
      "Fair enough for a quick bite.",
      "Average experience that could easily be better with a few tweaks.",
      "It was alright, but not particularly memorable.",
      "Decent option in the area if you need a simple meal.",
    ],
    connectors: [
      "However,",
      "At the same time,",
      "Also,",
      "On the other hand,",
      "Meanwhile,",
    ],
    generalImpression: [
      "The overall experience was average, neither particularly great nor bad.",
      "An okay visit overall, basic expectations were met.",
      "A fair experience, though some small details could be polished.",
      "Average dining experience that was reasonably fine.",
    ],
    aspects: {
      taste: [
        "The food taste was decent, though a bit mild for our liking.",
        "Taste was average and could use a bit more seasoning.",
        "The food tasted okay, pretty standard preparation.",
        "Taste was passable, neither exceptional nor bad.",
      ],
      freshness: [
        "Freshness was acceptable, though some items could be hotter.",
        "Food felt reasonably fresh, just standard everyday cooking.",
        "Freshness was moderate, about what you expect.",
        "The dishes were moderately fresh but could be served crisper.",
      ],
      speed: [
        "Service speed was moderate, took a little longer than expected.",
        "Service was neither very fast nor too slow.",
        "Had to wait a little while for our dishes to arrive.",
        "Order timing was acceptable but could be slightly faster.",
      ],
      staff: [
        "The staff was okay, though they seemed quite busy.",
        "Staff was polite enough, but could be slightly more responsive.",
        "Service was basic, staff did their job without much interaction.",
        "Staff was fair, though getting attention took an extra call.",
      ],
      cleanliness: [
        "Cleanliness was adequate, though tables could be cleared quicker.",
        "Basic hygiene was maintained, but tidiness could improve slightly.",
        "Cleanliness was acceptable for a regular dining place.",
        "Tables were reasonably clean, though attention to detail would help.",
      ],
      value: [
        "Prices are average and match the standard offering.",
        "Value for money was reasonable, neither cheap nor expensive.",
        "Fair pricing for the kind of meal provided.",
        "Price seemed standard for the basic setup.",
      ],
      portions: [
        "Portion sizes were modest but sufficient.",
        "Quantity was okay, just enough for one person.",
        "Portion sizes were standard, neither generous nor small.",
        "Servings were adequate, though slightly on the smaller side.",
      ],
      ambience: [
        "The ambience was simple and functional.",
        "Seating was basic, good enough for a quick meal.",
        "Atmosphere was okay, a bit noisy during peak hours.",
        "Simple dining space without much fuss.",
      ],
      family: [
        "It works for a simple family meal, though seating can get tight.",
        "Family seating was okay, though space was somewhat limited.",
        "Fair enough for family dining if you need a quick bite.",
        "Acceptable for families, but could be a little more comfortable.",
      ],
      takeaway: [
        "Takeaway packaging was basic and got the job done.",
        "Takeaway was handled in reasonable time, packing was average.",
        "Parcel service was okay, standard plastic packing.",
        "Takeaway was decent, though had to wait a few minutes at the counter.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // NEGATIVE BAND (Stars 1 - 2)
  // ---------------------------------------------------------------------------
  negative: {
    openers: [
      "Had a disappointing experience at Amol Veg Resto.",
      "Our visit here did not meet expectations.",
      "Unfortunately, our meal here fell short.",
      "Visited recently and was quite unsatisfied with the experience.",
      "Expected better based on the location, but had a poor visit.",
      "Had a rather frustrating time during our visit.",
      "The experience here needs serious improvement.",
    ],
    closers: [
      "Hope management takes note and makes necessary improvements.",
      "Would hesitate to visit again unless things improve.",
      "Needs a lot of improvement before I can consider returning.",
      "Quite disappointed with how our visit turned out.",
      "Expected a better standard for the visit.",
      "There is plenty of scope for improvement across the board.",
    ],
    connectors: [
      "Additionally,",
      "To make matters worse,",
      "Also,",
      "Furthermore,",
      "On top of that,",
    ],
    generalImpression: [
      "Overall, the visit was quite below standard and disappointing.",
      "Had an unsatisfactory experience and left disappointed.",
      "Multiple aspects of our visit fell short of basic expectations.",
      "A disappointing visit that definitely needs management attention.",
    ],
    aspects: {
      taste: [
        "The food taste was lacking flavor and did not feel authentic.",
        "The taste was quite bland and poorly seasoned.",
        "Did not enjoy the food taste as the seasoning was off.",
        "Food taste was disappointing and lacked standard flavor.",
      ],
      freshness: [
        "The food did not taste freshly prepared and lacked warmth.",
        "Items felt like they were made in advance and not served hot.",
        "Freshness was missing from the dishes served to us.",
        "The dishes felt stale and were served lukewarm.",
      ],
      speed: [
        "Service was notably slow and we had to wait too long for food.",
        "The delay in getting our order was frustrating.",
        "Orders took an unusually long time to arrive at our table.",
        "Service speed was very sluggish throughout the meal.",
      ],
      staff: [
        "Staff was inattentive and showed little interest in helping.",
        "Customer service from the staff was indifferent and careless.",
        "The staff seemed disorganized and unresponsive to requests.",
        "Had a hard time getting assistance from the staff.",
      ],
      cleanliness: [
        "Cleanliness was not up to standard and tables needed better wiping.",
        "Hygiene levels in the dining area were disappointing.",
        "Tables and surrounding areas were not cleaned properly.",
        "Cleanliness was poor and needed urgent attention.",
      ],
      value: [
        "The quality definitely did not justify the prices charged.",
        "Felt overpriced considering the subpar experience.",
        "Poor value for money for the food and service received.",
        "Did not feel like good value given the lack of quality.",
      ],
      portions: [
        "Portion sizes were surprisingly small for the price.",
        "The serving quantity was meager and insufficient.",
        "Portions felt stingy compared to other restaurants.",
        "Very small servings that left us unsatisfied.",
      ],
      ambience: [
        "The seating was cramped and uncomfortably noisy.",
        "The dining space felt crowded and poorly ventilated.",
        "Ambience was uncomfortable and needed better upkeep.",
        "Seating arrangement was awkward and far from comfortable.",
      ],
      family: [
        "Not comfortable for family dining due to cramped seating.",
        "The setup was noisy and uncomfortable for a family meal.",
        "Would not suggest this place for relaxed family dinners.",
        "Family dining was uncomfortable because of overcrowding.",
      ],
      takeaway: [
        "The takeaway packing was messy and leaked inside the bag.",
        "Takeaway took far too long to prepare and packing was poor.",
        "Parcel service was delayed and packing was careless.",
        "Disappointed with the takeaway handling and cold food.",
      ],
    },
  },
};

/**
 * Builds an instant local draft in 0ms without any network calls.
 * 
 * @param {number} stars - 1 to 5
 * @param {string[]} selectedIds - Array of option IDs selected by user
 * @param {number} seed - Deterministic seed for stable wording across taps
 * @param {Array<{id: string, label: string, positiveOnly?: boolean}>} optionsList - Available options with labels
 * @returns {string} - The generated review text
 */
export function buildLocalDraft(stars, selectedIds = [], seed = 42, optionsList = []) {
  const validStars = Math.min(Math.max(parseInt(stars, 10) || 5, 1), 5);

  let band = 'positive';
  if (validStars === 3) band = 'neutral';
  else if (validStars <= 2) band = 'negative';

  const bank = PHRASE_BANK[band];

  // Map option IDs to labels
  const labelMap = new Map();
  if (Array.isArray(optionsList)) {
    for (const opt of optionsList) {
      if (opt && opt.id) labelMap.set(opt.id, opt.label || opt.id);
    }
  }

  // Filter out any positiveOnly options if band is neutral or negative
  const filteredIds = selectedIds.filter((id) => {
    if (band === 'neutral' || band === 'negative') {
      if (id === 'pureveg') return false;
      const opt = optionsList.find((o) => o.id === id);
      if (opt && (opt.positiveOnly || opt.positive_only)) return false;
    }
    return true;
  });

  // Pick deterministic opener and closer
  const opener = pickWithSeed(bank.openers, seed, 1);
  const closer = pickWithSeed(bank.closers, seed, 99);

  // If no options are selected, return opener + general impression + closer
  if (filteredIds.length === 0) {
    const impression = pickWithSeed(bank.generalImpression, seed, 5);
    return `${opener} ${impression} ${closer}`.trim();
  }

  // Helper to get sentence for an option ID (using bank phrases if available, else generic label line)
  const getSentenceForOption = (id, index) => {
    if (bank.aspects[id]) {
      const phrases = bank.aspects[id];
      const optOffset = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), index * 10);
      return pickWithSeed(phrases, seed, optOffset);
    }

    // Generic label-based fallback per star band
    const label = labelMap.get(id) || id.replace(/[_-]/g, ' ');
    if (band === 'positive') {
      const positiveLines = [
        `The ${label.toLowerCase()} was genuinely good.`,
        `Really liked the ${label.toLowerCase()}.`,
        `The ${label.toLowerCase()} met our expectations nicely.`,
      ];
      return pickWithSeed(positiveLines, seed, index * 7);
    } else if (band === 'neutral') {
      const neutralLines = [
        `The ${label.toLowerCase()} was okay, though it could be better.`,
        `Felt the ${label.toLowerCase()} was fairly average.`,
        `The ${label.toLowerCase()} was standard, with room for improvement.`,
      ];
      return pickWithSeed(neutralLines, seed, index * 7);
    } else {
      const negativeLines = [
        `The ${label.toLowerCase()} was quite disappointing.`,
        `Expected much better ${label.toLowerCase()}.`,
        `The ${label.toLowerCase()} did not meet expectations.`,
      ];
      return pickWithSeed(negativeLines, seed, index * 7);
    }
  };

  // If 1 to 3 options selected, build individual sentences
  if (filteredIds.length <= 3) {
    const aspectSentences = filteredIds.map((id, index) => getSentenceForOption(id, index));
    const body = aspectSentences.join(' ');
    return `${opener} ${body} ${closer}`.trim();
  }

  // If more than 3 options selected:
  const primaryIds = filteredIds.slice(0, 2);
  const remainingIds = filteredIds.slice(2);

  const primarySentences = primaryIds.map((id, index) => getSentenceForOption(id, index));

  const connector = pickWithSeed(bank.connectors, seed, 7);
  let mergedSentence = '';

  const getCleanLabel = (id) => {
    const custom = labelMap.get(id);
    if (custom) return custom.toLowerCase();
    switch (id) {
      case 'taste': return 'food taste';
      case 'freshness': return 'freshness';
      case 'speed': return 'service speed';
      case 'staff': return 'staff service';
      case 'cleanliness': return 'cleanliness';
      case 'value': return 'pricing';
      case 'portions': return 'portion sizes';
      case 'ambience': return 'seating';
      case 'family': return 'family comfort';
      case 'takeaway': return 'takeaway packaging';
      case 'pureveg': return 'pure veg quality';
      default: return id.replace(/[_-]/g, ' ').toLowerCase();
    }
  };

  const labels = remainingIds.map(getCleanLabel);
  const labelListStr = `${labels.slice(0, -1).join(', ')}${labels.length > 1 ? ' and ' : ''}${labels.slice(-1)}`;

  if (band === 'positive') {
    mergedSentence = `${connector} we were also very satisfied with ${labelListStr}.`;
  } else if (band === 'neutral') {
    mergedSentence = `${connector} ${labelListStr} were just average and could be tuned better.`;
  } else {
    mergedSentence = `${connector} we also experienced issues with ${labelListStr}.`;
  }

  const allParts = [opener, ...primarySentences, mergedSentence, closer];
  return allParts.filter(Boolean).join(' ').trim();
}


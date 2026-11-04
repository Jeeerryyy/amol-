/**
 * AMOL VEG RESTO - Central Website Data & Configuration
 * Single source of truth for all editable content, navigation, contact details, and prices.
 */

export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface DishItem {
  id: string;
  title: string;
  description: string;
  price: string;
  placeholderText?: string;
  imageSrc?: string; // Replace with actual image path when available
}

export interface GalleryItem {
  id: string;
  label: string;
  imageSrc?: string; // Replace with actual image path when available
}

export interface GalleryPageItem {
  id: string;
  title: string;
  category: 'food' | 'ambience' | 'dining' | 'kitchen';
  caption: string;
  imageSrc?: string;
  aspect?: 'wide' | 'standard';
}

export interface ReviewItem {
  id: string;
  quote: string;
  attribution: string;
}

export interface SocialLink {
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'YouTube';
  url: string;
}

export const siteConfig = {
  brand: {
    name: "Amol Veg Resto",
    taglineNavbar: "PURE VEG FOOD, FRESH AND SERVED FAST.",
    taglineFooter: "Pure veg food, fresh and served fast.",
    heritage: "SINCE 1990.",
    logoPath: "/logo.png",
  },

  navbar: {
    links: [
      { label: "Home", href: "#/", isActive: true },
      { label: "Menu", href: "/menu/", isActive: false },
      { label: "About", href: "#/about", isActive: false },
      { label: "Gallery", href: "#/gallery", isActive: false },
      { label: "Contact", href: "#/contact", isActive: false },
    ] as NavLink[],
    callAction: {
      label: "Call Now",
      phone: "+91 72496 64983",
      tel: "tel:+917249664983",
    },
  },

  hero: {
    leftEyebrow: "PURE VEG. PURE TASTE.",
    heading: {
      line1: "Authentic",
      line2: "Flavours",
      line3: "Feel Like Home",
    },
    subtag: "ALWAYS AMOL.",
    rightEyebrow: "GOOD FOOD",
    rightHeadingLines: ["Brings", "People Together"],
    rightHeritage: "SINCE 1990.",
    exploreMenuButton: {
      text: "EXPLORE MENU",
      href: "/menu/",
    },
    heroImage: {
      label: "Hero Table Spread Placeholder (Thali with copper cloches)",
      src: "/images/hero-dish-card.jpg",
    },
  },

  popularDishes: {
    heading: {
      prefix: "Our",
      highlight: "Popular Dishes",
    },
    subtitle: "SIMPLE INGREDIENTS, MEMORABLE FLAVOURS.",
    dishes: [
      {
        id: "dish-1",
        title: "Dish 1",
        description: "A delicious and wholesome dish made with fresh ingredients.",
        price: "₹120",
        placeholderText: "Dosa with chutney & sambar bowls",
      },
      {
        id: "dish-2",
        title: "Dish 2",
        description: "Soft, fluffy and served with our special chutney & sambar.",
        price: "₹100",
        placeholderText: "Idli plate on banana leaf",
      },
      {
        id: "dish-3",
        title: "Dish 3",
        description: "A flavourful and light option perfect for any time of the day.",
        price: "₹110",
        placeholderText: "Fried-rice bowl",
      },
      {
        id: "dish-4",
        title: "Dish 4",
        description: "A complete and satisfying meal made with fresh, pure veg ingredients.",
        price: "₹150",
        placeholderText: "Thali (rice, curry, papad)",
      },
    ] as DishItem[],
    footerNote: "Full menu coming soon.",
  },

  about: {
    eyebrow: "ABOUT US",
    heading: {
      prefix: "Our",
      highlight: "Story",
    },
    paragraph:
      "Amol Veg Resto is a pure vegetarian restaurant in Sakhar Peth, Solapur. We serve fresh, tasty food in a clean, comfortable space, whether you dine in or take it home. Even on our busiest days, we keep the quality high and the service quick.",
    button: {
      text: "Read More →",
      href: "#/about",
    },
    image: {
      label: "Restaurant Atmosphere Placeholder",
      // TODO: Replace with interior photograph
      src: "",
    },
  },

  aboutPage: {
    hero: {
      eyebrow: "ABOUT US",
      heading: {
        prefix: "Amol",
        highlight: "Veg Resto",
      },
      description:
        "A pure vegetarian restaurant in Sakhar Peth, Solapur, serving fresh and tasty food in a clean and comfortable space.",
      sketchSrc: "/images/amol-sketch.jpg",
      sketchAlt: "Amol Veg Resto Storefront Architectural Sketch",
    },
    stats: [
      {
        value: "1990",
        label: "Serving Solapur Since",
      },
      {
        value: "100%",
        label: "Pure Vegetarian Kitchen",
      },
      {
        value: "50+",
        label: "Authentic Daily Delicacies",
      },
      {
        value: "30+",
        label: "Years of Culinary Passion",
      },
    ],
    owner: {
      eyebrow: "OUR STORY",
      heading: {
        prefix: "From",
        highlight: "Our Owner",
      },
      quote:
        "The idea behind Amol Veg Resto has always been simple — to serve pure vegetarian food that is fresh, tasty and made with care.",
      author: "Amol",
      narrative:
        "Starting as a dedicated family eatery in Sakhar Peth, our mission has remained steadfast: welcoming every guest with heartfelt warmth and preparing meals that bring the pure comfort of home-cooked goodness.",
      image: {
        label: "Restaurant Founder Portrait Placeholder",
      },
    },
    philosophy: {
      eyebrow: "OUR PHILOSOPHY",
      heading: {
        prefix: "The Principles Behind",
        highlight: "Every Plate",
      },
      cards: [
        {
          id: "tradition",
          title: "Pure Vegetarian Heritage",
          description:
            "Strictly 100% vegetarian culinary practices with zero compromises on cooking oil purity, authentic spices, and ritual kitchen cleanliness.",
        },
        {
          id: "local-taste",
          title: "Authentic Solapuri Flavors",
          description:
            "From crisp golden morning dosas and chutneys to hearty lunch thalis and savory curries, our recipes honor Solapur's culinary roots.",
        },
        {
          id: "hospitality",
          title: "Warm & Attentive Service",
          description:
            "Whether you're stopping by for a brisk workday lunch or enjoying a long family gathering, every dish is served piping hot with genuine care.",
        },
      ],
    },
    space: {
      eyebrow: "OUR SPACE",
      heading: {
        prefix: "Dine in",
        highlight: "Comfort",
      },
      paragraph:
        "A clean, comfortable and family-friendly dining space designed for an enjoyable food experience.",
      amenities: [
        "Air-Conditioned Dining Hall",
        "Spacious Family Seating",
        "Spotless Hygiene Standards",
        "Quick Takeaway & Parcel Counter",
      ],
      mainImage: {
        label: "Dining Hall Ambience Placeholder",
      },
      secondaryImage: {
        label: "Family Seating Corner Placeholder",
      },
    },
    visitCta: {
      heading: "Experience the Taste of Solapur",
      description:
        "Visit us at Station Road, Sakhar Peth or explore our delicious selection of freshly prepared vegetarian dishes.",
      menuBtnText: "Explore Our Menu →",
      menuBtnHref: "/menu/",
      contactBtnText: "Find Location & Contact →",
      contactBtnHref: "#/contact",
    },
  },

  gallery: {
    timelineNumber: "01",
    eyebrow: "GALLERY",
    heading: "A Glimpse of Amol Veg Resto",
    description: "Moments from our kitchen, dining space and the food we love to serve.",
    button: {
      text: "See More →",
      href: "#/gallery",
    },
    items: [
      { id: "gallery-1", label: "Gallery Photo 1" },
      { id: "gallery-2", label: "Gallery Photo 2" },
      { id: "gallery-3", label: "Gallery Photo 3" },
      { id: "gallery-4", label: "Gallery Photo 4" },
    ] as GalleryItem[],
  },

  galleryPage: {
    eyebrow: "OUR GALLERY",
    heading: {
      prefix: "Moments at",
      highlight: "Amol Veg Resto",
    },
    subtitle:
      "Explore our pure vegetarian delicacies, welcoming family dining atmosphere, and traditional kitchen craft in Sakhar Peth, Solapur.",
    categories: [
      { id: "all", label: "All", icon: "grid" },
      { id: "food", label: "Dishes & Food", icon: "utensils" },
      { id: "ambience", label: "Ambience & Hall", icon: "store" },
      { id: "dining", label: "Dining Moments", icon: "users" },
      { id: "kitchen", label: "Kitchen & Prep", icon: "cloche" },
    ],
    items: [
      // Row 1: 3 Wide Cards (as in reference layout)
      {
        id: "gal-1",
        title: "Crisp Golden Masala Dosa",
        category: "food",
        caption: "Ritual morning dosa served sizzling hot with coconut chutney & sambar.",
        aspect: "wide",
      },
      {
        id: "gal-2",
        title: "Air-Conditioned Family Dining Hall",
        category: "ambience",
        caption: "Spotless, spacious and comfortable seating designed for family meals.",
        aspect: "wide",
      },
      {
        id: "gal-3",
        title: "Ritual Kitchen Tadka & Fresh Cooking",
        category: "kitchen",
        caption: "Prepared daily with pure ingredients, whole spices and zero compromise.",
        aspect: "wide",
      },
      // Row 2: 4 Standard Cards (as in reference layout)
      {
        id: "gal-4",
        title: "Authentic Solapuri Special Thali",
        category: "food",
        caption: "Hearty vegetarian feast with warm rotis, curries, bhakri and dal.",
        aspect: "standard",
      },
      {
        id: "gal-5",
        title: "Steaming Brass Davara Filter Coffee",
        category: "food",
        caption: "Aromatic South Indian filter coffee brewed fresh in authentic brass cups.",
        aspect: "standard",
      },
      {
        id: "gal-6",
        title: "Joyful Gatherings & Warm Hospitality",
        category: "dining",
        caption: "Fast, caring service making every workday lunch and family dinner special.",
        aspect: "standard",
      },
      {
        id: "gal-7",
        title: "Quick Takeaway & Hygienic Parcel Counter",
        category: "kitchen",
        caption: "Prompt and sanitized packing so you can enjoy pure flavors at home.",
        aspect: "standard",
      },
      // Additional items for rich category filtering
      {
        id: "gal-8",
        title: "Crispy Medu Vada Platter",
        category: "food",
        caption: "Golden fried vadas with fluffy centers, served with fresh ground chutneys.",
        aspect: "standard",
      },
      {
        id: "gal-9",
        title: "Cozy Family Booth Seating",
        category: "ambience",
        caption: "Relaxed corners designed for quiet conversations and shared thalis.",
        aspect: "standard",
      },
      {
        id: "gal-10",
        title: "Sunday Family Dining Rush",
        category: "dining",
        caption: "A bustling dining room filled with the aromas of fresh dosas and coffee.",
        aspect: "standard",
      },
      {
        id: "gal-11",
        title: "Master Chef Tandoor & Roti Station",
        category: "kitchen",
        caption: "Watch fresh rotis and naans baked hot straight from the kitchen hearth.",
        aspect: "standard",
      },
    ] as GalleryPageItem[],
  },

  testimonials: {
    heading: {
      prefix: "What Our",
      highlight: "Guests Say",
    },
    rating: {
      scoreText: "3.9 ★ on Google",
      reviewCount: "253 reviews",
    },
    reviews: [
      {
        id: "review-1",
        quote:
          "Everything I ordered was fresh, tasty, and well prepared. The service was quick and attentive even when the place was busy. Great to have a pure veg restaurant that keeps up both quality and speed.",
        attribution: "Google Review",
      },
      {
        id: "review-2",
        quote: "All dishes are tasty, it's a nice place and hygienic.",
        attribution: "Pavan Bandi · Google Review",
      },
    ] as ReviewItem[],
    googleReviewsLink: {
      text: "Read more reviews on Google",
      href: "https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76",
    },
  },

  footer: {
    tagline: "Pure veg food, fresh and served fast.",
    illustrationSrc: "/images/footer-illustration.jpg",
    illustrationAlt: "Solapur landmarks, temple gopuram, lake, and authentic South Indian food spread",
    quickLinks: [
      { label: "Home", href: "#/" },
      { label: "About", href: "#/about" },
      { label: "Gallery", href: "#/gallery" },
      { label: "Contact", href: "#/contact" },
    ],
    visitUs: {
      address: "123, Station Road, Sakhar Peth, Solapur, Maharashtra - 413001",
      hours: "Opens 12 PM",
      phone: "+91 98765 43210",
      tel: "tel:+919876543210",
      directionsUrl: "https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76",
    },
    socials: [
      { platform: "Instagram", url: "#" },
      { platform: "Facebook", url: "#" },
      { platform: "WhatsApp", url: "https://wa.me/917249664983" },
      { platform: "YouTube", url: "#" },
    ] as SocialLink[],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms & Conditions", href: "#terms" },
    ],
    bottomBar: {
      copyright: "© 2026 Amol Veg Resto. All rights reserved.",
      fssai: "FSSAI Lic. No: [TO BE ADDED]",
      agencyName: "Website by Nirvanaa Studios",
      agencyUrl: "#",
    },
  },
  contactPage: {
    eyebrow: "CONTACT",
    heading: {
      prefix: "Get in",
      highlight: "Touch",
    },
    subtitle: "Have a question, feedback or a reservation request? We're here to help.",
    info: {
      location: {
        title: "Location",
        detail: "Sakhar Peth,\nSolapur – 413001",
      },
      call: {
        title: "Call Us",
        detail: "+91 98765 43210",
        tel: "tel:+919876543210",
      },
      hours: {
        title: "Open Hours",
        detail: "12:00 PM – 11:00 PM",
      },
    },
    form: {
      heading: {
        prefix: "Send us a",
        highlight: "Message",
      },
      ratingLabel: "Rate Your Experience",
      buttonText: "Submit",
    },
  },
};


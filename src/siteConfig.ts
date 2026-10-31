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
      { label: "Home", href: "#", isActive: true },
      { label: "About", href: "#about", isActive: false },
      { label: "Gallery", href: "#gallery", isActive: false },
      { label: "Contact", href: "#contact", isActive: false },
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
      href: "#popular-dishes",
    },
    heroImage: {
      label: "Hero Table Spread Placeholder (Thali with copper cloches)",
      // TODO: Replace with frame sequence or final hero photo
      src: "",
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
      href: "#about",
    },
    image: {
      label: "Restaurant Atmosphere Placeholder",
      // TODO: Replace with interior photograph
      src: "",
    },
  },

  gallery: {
    timelineNumber: "01",
    eyebrow: "GALLERY",
    heading: "A Glimpse of Amol Veg Resto",
    description: "Moments from our kitchen, dining space and the food we love to serve.",
    button: {
      text: "See More →",
      href: "#gallery",
    },
    items: [
      { id: "gallery-1", label: "Gallery Photo 1" },
      { id: "gallery-2", label: "Gallery Photo 2" },
      { id: "gallery-3", label: "Gallery Photo 3" },
      { id: "gallery-4", label: "Gallery Photo 4" },
    ] as GalleryItem[],
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
      href: "https://maps.app.goo.gl/zp7RDvhrkJNiTKri9",
    },
  },

  footer: {
    tagline: "Pure veg food, fresh and served fast.",
    quickLinks: [
      { label: "Home", href: "#" },
      { label: "About", href: "#about" },
      { label: "Gallery", href: "#gallery" },
      { label: "Contact", href: "#contact" },
    ],
    visitUs: {
      address: "123, Station Road, Sakhar Peth, Solapur, Maharashtra - 413001",
      hours: "Opens 12 PM",
      phone: "+91 98765 43210",
      tel: "tel:+919876543210",
      directionsUrl: "https://maps.app.goo.gl/zp7RDvhrkJNiTKri9",
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
};

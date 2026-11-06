import React, { useState } from 'react';
import './FAQ.css';

export interface FAQItem {
  id: string;
  category: 'general' | 'timings' | 'location' | 'menu' | 'delivery' | 'dining';
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: 'general' | 'timings' | 'location' | 'menu' | 'delivery' | 'dining';
  label: string;
  icon: string;
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'general', label: 'General', icon: 'utensils' },
  { id: 'timings', label: 'Timings', icon: 'clock' },
  { id: 'location', label: 'Location', icon: 'map-pin' },
  { id: 'menu', label: 'Menu & Cuisines', icon: 'cloche' },
  { id: 'delivery', label: 'Delivery & Service', icon: 'scooter' },
  { id: 'dining', label: 'Dining & Facilities', icon: 'dining' },
];

export const FAQ_DATA: FAQItem[] = [
  // General (Matches the 4 questions shown in reference wireframe)
  {
    id: 'gen-1',
    category: 'general',
    question: 'Is Amol Veg Resto a 100% pure vegetarian restaurant in Solapur?',
    answer:
      'Yes, Amol Veg Resto is a 100% pure vegetarian restaurant in Solapur, serving a wide variety of fresh and flavorful veg dishes prepared with strict culinary standards, pure oils, and daily sourced ingredients.',
  },
  {
    id: 'gen-2',
    category: 'general',
    question: 'What are the opening hours of Amol Veg Resto Solapur?',
    answer:
      'We are open all 7 days of the week from 11:00 AM to 11:30 PM continuously. You can visit anytime for early lunch, afternoon snacks, family dinner, or late-evening dining.',
  },
  {
    id: 'gen-3',
    category: 'general',
    question: 'Where is Amol Veg Resto located in Solapur?',
    answer:
      'Our restaurant is located at Gala No 2, Plot 16/1, Markandeya Yantramag Sahakari Sanstha, Karnik Nagar Road, near Uphar Bakery and Ashok Chowk, Sakhar Peth, Solapur, Maharashtra 413006.',
  },
  {
    id: 'gen-4',
    category: 'general',
    question: 'Can I view the full digital menu with current prices online?',
    answer:
      'Yes! You can browse our entire digital menu of 280+ dishes across 24 categories with transparent, live prices at /menu/. Table QR codes also open this digital menu instantly.',
  },

  // Timings
  {
    id: 'time-1',
    category: 'timings',
    question: 'What are the daily operating hours for lunch and dinner?',
    answer:
      'We serve freshly cooked meals from 11:00 AM in the morning through 11:30 PM at night without any afternoon closure. Hot snacks and meals are available continuously.',
  },
  {
    id: 'time-2',
    category: 'timings',
    question: 'What time does the kitchen stop accepting takeaway parcel orders?',
    answer:
      'Our dedicated takeaway parcel counter accepts orders until 11:15 PM every night. You can call +91 72496 64983 in advance to have your parcel packed and ready upon arrival.',
  },
  {
    id: 'time-3',
    category: 'timings',
    question: 'What are the peak family dining hours on weekends?',
    answer:
      'Weekend rush typically occurs between 1:00 PM – 3:00 PM for lunch and 8:00 PM – 10:30 PM for dinner. We recommend arriving early or calling ahead for table arrangements.',
  },

  // Location
  {
    id: 'loc-1',
    category: 'location',
    question: 'What are the easiest landmarks to find Amol Veg Resto in Sakhar Peth?',
    answer:
      'We are situated along Karnik Nagar Road right near Uphar Bakery and Ashok Chowk in Sakhar Peth, approximately 10 minutes from Solapur Railway Station and Old Pune Naka.',
  },
  {
    id: 'loc-2',
    category: 'location',
    question: 'Is parking available for two-wheelers and four-wheelers?',
    answer:
      'Yes, convenient parking space is available directly in front of and alongside the restaurant premises on Karnik Nagar Road for both two-wheelers and cars.',
  },
  {
    id: 'loc-3',
    category: 'location',
    question: 'Can I get direct navigation directions via Google Maps?',
    answer:
      'Yes! Click the "Get Directions" button below or search "Amol Veg Resto Sakhar Peth Solapur" on Google Maps for turn-by-turn navigation.',
  },

  // Menu & Cuisines
  {
    id: 'menu-1',
    category: 'menu',
    question: 'What cuisines and signature dishes are most popular at Amol Veg?',
    answer:
      'Our guest favorites include crisp butter dosas, soft idlis, authentic Solapuri & Maharashtrian Thalis, rich North Indian paneer curries with tandoor rotis, Veg Grill Sandwiches, and aromatic filter coffee.',
  },
  {
    id: 'menu-2',
    category: 'menu',
    question: 'Do you prepare Jain vegetarian dishes without onion and garlic?',
    answer:
      'Yes! We proudly prepare dedicated Jain options upon request. Simply notify our waitstaff when ordering, and our chefs will ensure zero onion and garlic in your meal.',
  },
  {
    id: 'menu-3',
    category: 'menu',
    question: 'Are South Indian breakfast items available throughout the day?',
    answer:
      'Yes, freshly steamed idlis, medu vadas, and a variety of crispy dosas are prepared and served hot all day from 11:00 AM to 11:30 PM.',
  },

  // Delivery & Service
  {
    id: 'del-1',
    category: 'delivery',
    question: 'Do you offer parcel and takeaway service in Solapur?',
    answer:
      'Yes! We have a sanitized, dedicated takeaway counter with leak-proof food packaging. Call +91 72496 64983 or message us on WhatsApp to place a pickup order.',
  },
  {
    id: 'del-2',
    category: 'delivery',
    question: 'Can I place bulk food parcel orders for family functions or office lunch?',
    answer:
      'Yes, we cater bulk family parcel orders and corporate lunch boxes with prior notice. Call our manager directly at +91 72496 64983 for special arrangements.',
  },
  {
    id: 'del-3',
    category: 'delivery',
    question: 'What digital payment modes are accepted at the restaurant?',
    answer:
      'We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), debit/credit cards, and cash payments at the billing counter.',
  },

  // Dining & Facilities
  {
    id: 'din-1',
    category: 'dining',
    question: 'Does Amol Veg Resto have air-conditioned family dining seating?',
    answer:
      'Yes! We feature a spacious, clean, and air-conditioned dining section specifically arranged for comfortable family meals, business meetings, and celebrations.',
  },
  {
    id: 'din-2',
    category: 'dining',
    question: 'Can we reserve seating for family birthdays or small get-togethers?',
    answer:
      'Yes, we accommodate table reservations for birthdays, anniversaries, and family celebrations. Please call +91 72496 64983 a few hours in advance to reserve your spot.',
  },
  {
    id: 'din-3',
    category: 'dining',
    question: 'What hygiene and food safety standards are maintained?',
    answer:
      'We enforce rigorous hygiene standards: RO-purified drinking water, sanitized stainless-steel cookware, daily kitchen deep cleans, and zero reuse of cooking oils.',
  },
];

// Clean line-art SVG icons matching the reference design
const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name,
  size = 18,
  className = '',
}) => {
  switch (name) {
    case 'utensils':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M18 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
          <path d="M6 2v20" />
          <path d="M3 2v6a3 3 0 0 0 6 0V2" />
        </svg>
      );
    case 'clock':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'cloche':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M4 18h16" />
          <path d="M4 18a8 8 0 0 1 16 0" />
          <path d="M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          <path d="M12 6v4" />
        </svg>
      );
    case 'scooter':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="18.5" cy="17.5" r="3.5" />
          <circle cx="5.5" cy="17.5" r="3.5" />
          <path d="M15 6h4l2 5v4h-2" />
          <path d="M9 17h6" />
          <path d="M12 9V6H4v8h2" />
        </svg>
      );
    case 'dining':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'chevron-up':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'chat-help':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeWidth="2.2" />
          <line x1="12" y1="16.5" x2="12.01" y2="16.5" strokeWidth="2.4" />
        </svg>
      );
    case 'phone':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'map-pin-filled':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="currentColor" fillOpacity="0.15" />
          <circle cx="12" cy="10" r="3" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

export const FAQ: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('general');
  // Default first question open like in the reference image
  const [openQuestionId, setOpenQuestionId] = useState<string | null>('gen-1');

  // Filter questions for the active category
  const activeQuestions = FAQ_DATA.filter((q) => q.category === activeCategoryId);

  // Category index for pagination controls
  const activeCategoryIndex = FAQ_CATEGORIES.findIndex((c) => c.id === activeCategoryId);
  const totalCategories = FAQ_CATEGORIES.length;

  const handleCategoryChange = (catId: string) => {
    setActiveCategoryId(catId);
    // Open the first question in the new category
    const firstInCat = FAQ_DATA.find((q) => q.category === catId);
    if (firstInCat) {
      setOpenQuestionId(firstInCat.id);
    }
  };

  const handlePrevCategory = () => {
    const prevIdx = (activeCategoryIndex - 1 + totalCategories) % totalCategories;
    handleCategoryChange(FAQ_CATEGORIES[prevIdx].id);
  };

  const handleNextCategory = () => {
    const nextIdx = (activeCategoryIndex + 1) % totalCategories;
    handleCategoryChange(FAQ_CATEGORIES[nextIdx].id);
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId);
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container faq-container">
        
        {/* 1. Centered Header matching Reference: — FAQ — */}
        <div className="faq-header">
          <div className="faq-eyebrow-wrapper">
            <span className="faq-eyebrow-line" aria-hidden="true" />
            <span className="faq-eyebrow">FAQ</span>
            <span className="faq-eyebrow-line" aria-hidden="true" />
          </div>
          <h2 id="faq-heading" className="faq-heading">
            Frequently Asked Questions
          </h2>
          <p className="faq-subtitle">
            Quick answers to common questions about Amol Veg Resto.
          </p>
        </div>

        {/* 2. Main Two-Column Layout (Sidebar + Accordion) */}
        <div className="faq-main-layout">
          
          {/* Left Column: Category Sidebar */}
          <aside className="faq-sidebar" role="tablist" aria-label="FAQ Categories">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  type="button"
                  className={`faq-cat-tab ${isActive ? 'active' : ''}`}
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {/* Active Orange Indicator Bar */}
                  {isActive && <span className="faq-active-bar" aria-hidden="true" />}
                  <span className="faq-cat-icon">
                    <Icon name={cat.icon} size={18} />
                  </span>
                  <span className="faq-cat-label">{cat.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Column: Accordion Questions List */}
          <div className="faq-content-column">
            <div className="faq-accordion-list" role="region" aria-label="FAQ Questions">
              {activeQuestions.map((item) => {
                const isOpen = openQuestionId === item.id;
                return (
                  <article
                    key={item.id}
                    className={`faq-item-card ${isOpen ? 'open' : ''}`}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <button
                      type="button"
                      className="faq-item-trigger"
                      onClick={() => toggleQuestion(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <h3 className="faq-item-question" itemProp="name">
                        {item.question}
                      </h3>
                      <span className="faq-item-chevron" aria-hidden="true">
                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} />
                      </span>
                    </button>

                    <div
                      id={`faq-answer-${item.id}`}
                      className={`faq-item-collapse ${isOpen ? 'show' : ''}`}
                      role="region"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      aria-hidden={!isOpen}
                    >
                      <div className="faq-item-body" itemProp="text">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination / Category Navigation Controls below Accordion */}
            <div className="faq-pagination-row" aria-label="FAQ Category Navigation">
              <button
                type="button"
                className="faq-nav-circle-btn"
                onClick={handlePrevCategory}
                aria-label="Previous FAQ Category"
              >
                <Icon name="chevron-left" size={16} />
              </button>

              <div className="faq-pagination-dots" role="tablist">
                {FAQ_CATEGORIES.map((cat, idx) => {
                  const isCurrent = cat.id === activeCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`faq-page-dot ${isCurrent ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat.id)}
                      aria-label={`Switch to ${cat.label} (${idx + 1} of ${totalCategories})`}
                      aria-selected={isCurrent}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                className="faq-nav-circle-btn"
                onClick={handleNextCategory}
                aria-label="Next FAQ Category"
              >
                <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* 3. Bottom Support CTA Bar matching Reference Image */}
        <div className="faq-bottom-cta-card">
          <div className="faq-cta-left">
            <div className="faq-cta-icon-bubble" aria-hidden="true">
              <Icon name="chat-help" size={20} />
            </div>
            <span className="faq-cta-divider" aria-hidden="true" />
            <p className="faq-cta-message">
              Still have questions? We're here to help!
            </p>
          </div>

          <div className="faq-cta-right">
            <a href="tel:+917249664983" className="faq-cta-call-btn">
              <Icon name="phone" size={14} />
              <span>Call +91 72496 64983</span>
            </a>
            <a
              href="https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76"
              target="_blank"
              rel="noopener noreferrer"
              className="faq-cta-directions-btn"
            >
              <Icon name="map-pin-filled" size={15} />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;

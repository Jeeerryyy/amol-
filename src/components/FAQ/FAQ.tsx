import React, { useState } from 'react';
import './FAQ.css';

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Is Amol Veg Resto a 100% pure vegetarian restaurant in Solapur?",
    answer: "Yes, Amol Veg Resto is strictly a 100% pure vegetarian restaurant located in Sakhar Peth, Solapur. We maintain rigorous vegetarian culinary standards with zero compromises on oil purity, fresh local ingredients, and kitchen hygiene."
  },
  {
    question: "What are the opening hours of Amol Veg Resto Solapur?",
    answer: "We are open all 7 days of the week from 11:00 AM to 11:30 PM. Whether you're visiting for early lunch, an afternoon snack, or late family dinner, our kitchen is always ready to serve."
  },
  {
    question: "Where is Amol Veg Resto located in Solapur?",
    answer: "Our exact address is Gala No 2, Plot 16/1, Markandeya Yantramag Sahakari Sanstha, Karnik Nagar Road, near Uphar Bakery and Ashok Chowk, Sakhar Peth, Solapur, Maharashtra 413006."
  },
  {
    question: "Can I view the full digital menu with current prices online?",
    answer: "Yes! You can view all 280+ pure vegetarian dishes across 24 categories with updated prices directly on our official digital menu at /menu/. You can also scan our QR codes at any dining table."
  },
  {
    question: "What cuisines and dishes are most popular at Amol Veg Resto?",
    answer: "Our guests love our crisp South Indian dosas and idlis, traditional Solapuri and Maharashtrian Thalis, rich North Indian paneer curries, tandoor rotis, Veg Grill Sandwiches, and aromatic filter coffee."
  },
  {
    question: "Do you offer takeaway, parcel service, or delivery in Solapur?",
    answer: "Yes! We have a dedicated, sanitized takeaway and parcel counter. You can place your parcel order by calling +91 72496 64983 or messaging us on WhatsApp."
  },
  {
    question: "Does Amol Veg Resto have air-conditioned family seating?",
    answer: "Yes, we feature clean, comfortable, air-conditioned seating designed specifically for families, business gatherings, and group celebrations in Sakhar Peth."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container faq-container">
        <div className="faq-header">
          <span className="faq-eyebrow">COMMON QUESTIONS</span>
          <h2 id="faq-heading" className="faq-heading">
            Frequently Asked <span className="text-orange">Questions</span>
          </h2>
          <p className="faq-subtitle">
            Everything you need to know about dining, takeaway, menu, and location at Amol Veg Resto Solapur.
          </p>
        </div>

        <div className="faq-accordion" role="region" aria-label="FAQ Accordion">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`faq-card ${isOpen ? 'active' : ''}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="faq-question-text" itemProp="name">{item.question}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`faq-answer-collapse ${isOpen ? 'open' : ''}`}
                  role="region"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div className="faq-answer-body" itemProp="text">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-footer-cta">
          <p>Still have questions? We'd love to help!</p>
          <div className="faq-cta-buttons">
            <a href="tel:+917249664983" className="faq-btn-call">
              📞 Call +91 72496 64983
            </a>
            <a href="https://maps.app.goo.gl/hMPnkZ2aZg2Pmqn76" target="_blank" rel="noopener noreferrer" className="faq-btn-maps">
              📍 Get Directions on Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

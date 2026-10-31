import React from 'react';
import { siteConfig } from '../../siteConfig';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import './TestimonialsSection.css';

export const TestimonialsSection: React.FC = () => {
  const { testimonials } = siteConfig;

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        {/* Section Heading */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            {testimonials.heading.prefix}{' '}
            <span className="text-orange">{testimonials.heading.highlight}</span>
          </h2>
          <p className="testimonials-rating-line">
            <span className="rating-score text-orange">{testimonials.rating.scoreText}</span>
            <span className="rating-dot"> · </span>
            <span className="rating-count">{testimonials.rating.reviewCount}</span>
          </p>
        </div>

        {/* 2 Review Cards Grid */}
        <div className="testimonials-cards-grid">
          {testimonials.reviews.map((rev) => (
            <div key={rev.id} className="review-card">
              {/* Quote mark glyph */}
              <div className="review-quote-glyph" aria-hidden="true">
                “
              </div>
              <p className="review-text">{rev.quote}</p>
              <div className="review-attribution-group">
                <div className="review-attribution-rule" aria-hidden="true" />
                <span className="review-attribution-text">{rev.attribution}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pager Buttons: Prev (outline) and Next (filled orange) */}
        <div className="testimonials-pager">
          <button className="pager-arrow-btn pager-prev" aria-label="Previous review">
            <ArrowLeft size={18} color="var(--color-text-dark)" />
          </button>
          <button className="pager-arrow-btn pager-next" aria-label="Next review">
            <ArrowRight size={18} color="#ffffff" />
          </button>
        </div>

        {/* External Google Reviews Link */}
        <div className="google-reviews-link-wrap">
          <a
            href={testimonials.googleReviewsLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="google-reviews-link"
          >
            <span>{testimonials.googleReviewsLink.text}</span>
            <ExternalLink size={14} className="external-icon" />
          </a>
        </div>
      </div>
    </section>
  );
};


import React from 'react';
import { siteConfig } from '../../siteConfig';
import { ArrowLeft, ArrowRight, ExternalLink, Star } from 'lucide-react';
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
            <span className="rating-score text-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>3.9</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>on Google</span>
            </span>
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

        {/* Actions: Review Us Button + External Google Reviews Link */}
        <div className="testimonials-actions-wrap">
          <a
            href="#/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-review-us-main"
          >
            <Star size={16} fill="currentColor" />
            <span>Review Us</span>
          </a>
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


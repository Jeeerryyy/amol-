import React, { useRef } from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './GallerySection.css';

export const GallerySection: React.FC = () => {
  const { gallery } = siteConfig;
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollOffset = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <section className="gallery-section" id="gallery">
      <div className="container gallery-container">
        {/* Left Side: Timeline + Text Info */}
        <div className="gallery-left-wrap">
          {/* Vertical Timeline Indicator */}
          <div className="gallery-timeline" aria-hidden="true">
            <div className="timeline-node timeline-dot" />
            <div className="timeline-node timeline-badge">
              <span>{gallery.timelineNumber}</span>
            </div>
            <div className="timeline-node timeline-dot" />
            <div className="timeline-node timeline-dot" />
            <div className="timeline-line" />
          </div>

          {/* Text Content */}
          <div className="gallery-text-block">
            <span className="gallery-eyebrow">{gallery.eyebrow}</span>
            <h2 className="gallery-heading">{gallery.heading}</h2>
            <p className="gallery-description">{gallery.description}</p>
            <a href={gallery.button.href} className="gallery-outline-btn">
              {gallery.button.text}
            </a>
          </div>
        </div>

        {/* Right Side: Arrow Controls & Overflow Carousel */}
        <div className="gallery-right-wrap">
          {/* Arrow Buttons Header */}
          <div className="gallery-controls">
            <button
              onClick={() => scrollByAmount('left')}
              className="gallery-arrow-btn"
              aria-label="Previous gallery image"
            >
              <ArrowLeft size={18} color="var(--color-text-dark)" />
            </button>
            <button
              onClick={() => scrollByAmount('right')}
              className="gallery-arrow-btn"
              aria-label="Next gallery image"
            >
              <ArrowRight size={18} color="var(--color-text-dark)" />
            </button>
          </div>

          {/* Carousel Track */}
          <div className="gallery-carousel-track" ref={carouselRef}>
            {gallery.items.map((item) => (
              <div key={item.id} className="gallery-card-item">
                <PlaceholderImage
                  label={item.label}
                  width="250px"
                  height="280px"
                  borderRadius="var(--radius-md)"
                  className="gallery-placeholder"
                />
              </div>
            ))}
            {/* Additional item to show the trailing cutoff edge */}
            <div className="gallery-card-item">
              <PlaceholderImage
                label="Gallery Photo 5"
                width="250px"
                height="280px"
                borderRadius="var(--radius-md)"
                className="gallery-placeholder"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './GallerySection.css';

interface GallerySectionItem {
  id: string;
  label: string;
  imageUrl?: string;
}

export const GallerySection: React.FC = () => {
  const { gallery } = siteConfig;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<GallerySectionItem[]>(gallery.items);

  useEffect(() => {
    fetch('/api/public/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: GallerySectionItem[] = data.map((item) => ({
            id: item.id,
            label: item.caption || item.alt_text || 'Amol Veg Gallery',
            imageUrl: item.url,
          }));
          setItems(mapped);
        }
      })
      .catch((err) => {
        console.warn('[GallerySection] Using bundled gallery fallback:', err);
      });
  }, []);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollOffset = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <section className="gallery-section" id="gallery">
      <div className="container gallery-container">
        {/* Left Side: Text Info */}
        <div className="gallery-left-wrap">
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
            {items.map((item) => (
              <div key={item.id} className="gallery-card-item">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    style={{
                      width: '250px',
                      height: '280px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                ) : (
                  <PlaceholderImage
                    label={item.label}
                    width="250px"
                    height="280px"
                    borderRadius="var(--radius-md)"
                    className="gallery-placeholder"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

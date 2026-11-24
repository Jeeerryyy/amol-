import React, { useState, useEffect } from 'react';
import { siteConfig } from '../../siteConfig';
import BounceCards from '../BounceCards/BounceCards';
import './GallerySection.css';

interface GallerySectionItem {
  id: string;
  label: string;
  imageUrl?: string;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop&q=80',
];

export const GallerySection: React.FC = () => {
  const { gallery } = siteConfig;
  const [items, setItems] = useState<GallerySectionItem[]>(gallery.items);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchGallery = () => {
      fetch('/api/public/gallery')
        .then((res) => {
          if (!res.ok) throw new Error('API unavailable');
          return res.json();
        })
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const valid = data.filter((item) => item.url && item.url.trim().length > 0);
            if (valid.length > 0) {
              const mapped: GallerySectionItem[] = valid.map((item) => ({
                id: item.id,
                label: item.caption || item.alt_text || 'Amol Veg Gallery',
                imageUrl: item.url,
              }));
              setItems(mapped);
            }
          }
        })
        .catch((err) => {
          console.warn('[GallerySection] Using bundled gallery fallback:', err);
        });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(fetchGallery, { timeout: 4000 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(fetchGallery, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Compute responsive BounceCards dimensions (Generous larger cards)
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const bounceConfig = isMobile
    ? {
        containerWidth: Math.min(windowWidth - 24, 380),
        containerHeight: 330,
        cardSize: 200,
        spread: 54,
        pushDistance: 110,
        borderWidth: 5,
        radius: 22,
      }
    : isTablet
    ? {
        containerWidth: 540,
        containerHeight: 380,
        cardSize: 240,
        spread: 88,
        pushDistance: 165,
        borderWidth: 6,
        radius: 26,
      }
    : {
        containerWidth: 640,
        containerHeight: 430,
        cardSize: 280,
        spread: 105,
        pushDistance: 200,
        borderWidth: 6,
        radius: 28,
      };

  const validGallery = items.filter((it) => it.imageUrl && it.imageUrl.trim().length > 0);
  const bounceImages =
    validGallery.length >= 3
      ? validGallery.slice(0, 5).map((it) => ({
          src: it.imageUrl!,
          alt: it.label || 'Amol Veg Resto Gallery',
        }))
      : fallbackImages;

  return (
    <section className="gallery-section" id="gallery">
      <div className="container gallery-container">
        {/* Left Side: Text Info */}
        <div className="gallery-left-wrap">
          <div className="gallery-text-block">
            <span className="gallery-eyebrow">{gallery.eyebrow}</span>
            <h2 className="gallery-heading">{gallery.heading}</h2>
            <p className="gallery-description">{gallery.description}</p>
            <a href={gallery.button.href} className="gallery-outline-btn">
              {gallery.button.text}
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Bounce Cards */}
        <div className="gallery-right-wrap">
          <div className="gallery-bounce-wrapper">
            <BounceCards
              images={bounceImages}
              containerWidth={bounceConfig.containerWidth}
              containerHeight={bounceConfig.containerHeight}
              cardSize={bounceConfig.cardSize}
              spread={bounceConfig.spread}
              rotation={10}
              arc={0}
              pushDistance={bounceConfig.pushDistance}
              hoverScale={1.06}
              bounciness={0.6}
              animationDelay={0.3}
              animationStagger={0.06}
              borderWidth={bounceConfig.borderWidth}
              borderColor="#ffffff"
              radius={bounceConfig.radius}
              shadow
              enableHover
              onCardClick={() => {
                window.location.hash = '#/gallery';
              }}
            />
            <div className="gallery-interactive-caption">
              <span>Hover or tap cards to interact • Click to view full gallery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

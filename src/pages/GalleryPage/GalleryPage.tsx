import React, { useState, useEffect } from 'react';
import { siteConfig, GalleryPageItem } from '../../siteConfig';
import {
  LayoutGrid,
  UtensilsCrossed,
  Store,
  Users,
  ConciergeBell,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MapPin,
  Utensils,
} from 'lucide-react';
import './GalleryPage.css';

export const GalleryPage: React.FC = () => {
  const { galleryPage } = siteConfig;
  const [itemsList, setItemsList] = useState<GalleryPageItem[]>(galleryPage.items);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch('/api/public/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: GalleryPageItem[] = data.map((item) => ({
            id: item.id,
            title: item.alt_text || item.caption || 'Amol Veg Gallery',
            category: (item.category as any) || 'food',
            caption: item.caption || item.alt_text || '',
            imageSrc: item.url,
            aspect: item.aspect === 'wide' ? 'wide' : 'standard',
          }));
          setItemsList(mapped);
        }
      })
      .catch((err) => {
        console.warn('[GalleryPage] Using bundled fallback gallery:', err);
      });
  }, []);

  // Filter items based on active category
  const filteredItems =
    activeCategory === 'all'
      ? itemsList
      : itemsList.filter((item) => item.category === activeCategory);

  // Split into Row 1 (3 items) and Row 2 (4 items) when viewing "All", plus remaining for dynamic growth
  const row1Items = itemsList.slice(0, 3);
  const row2Items = itemsList.slice(3, 7);
  const remainingItems = itemsList.slice(7);

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : filteredItems.length - 1) : null
        );
      }
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev < filteredItems.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredItems.length]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'grid':
        return LayoutGrid;
      case 'utensils':
        return UtensilsCrossed;
      case 'store':
        return Store;
      case 'users':
        return Users;
      case 'cloche':
        return ConciergeBell;
      default:
        return LayoutGrid;
    }
  };

  const openLightbox = (item: GalleryPageItem) => {
    const index = filteredItems.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      setActiveLightboxIndex(index);
    }
  };

  const currentLightboxItem =
    activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <div className="gallery-subpage" id="gallery-page">
      {/* Soft Decorative Organic Shapes in Corners (from reference layout) */}
      <div className="gallery-corner-shape-left" aria-hidden="true">
        <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-40 -40 C140 -20, 240 80, 200 240 C160 360, 40 280, -40 280 Z"
            fill="rgba(235, 218, 198, 0.45)"
          />
        </svg>
      </div>

      <div className="gallery-corner-shape-right" aria-hidden="true">
        <svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M360 -40 C220 20, 100 120, 130 250 C160 340, 300 320, 360 280 Z"
            fill="rgba(235, 218, 198, 0.45)"
          />
        </svg>
      </div>

      <div className="container gallery-page-container">
        {/* Header Section */}
        <header className="gallery-page-header">
          {/* Eyebrow with decorative framing rules */}
          <div className="gallery-eyebrow-container">
            <span className="gallery-eyebrow-rule" aria-hidden="true" />
            <span className="gallery-eyebrow-text">{galleryPage.eyebrow}</span>
            <span className="gallery-eyebrow-rule" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h1 className="gallery-page-heading">
            {galleryPage.heading.prefix}{' '}
            <span className="text-orange">{galleryPage.heading.highlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="gallery-page-subtitle">{galleryPage.subtitle}</p>
        </header>

        {/* Category Filter Pills (5 Capsules as in reference) */}
        <nav
          className="gallery-filter-navbar"
          role="tablist"
          aria-label="Gallery category filters"
        >
          {galleryPage.categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const isActive = activeCategory === category.id;
            const count =
              category.id === 'all'
                ? galleryPage.items.length
                : galleryPage.items.filter((item) => item.category === category.id).length;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`gallery-filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon size={16} strokeWidth={2} className="pill-icon" />
                <span className="pill-label">{category.label}</span>
                <span className="pill-badge">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Gallery Display Grid */}
        <main className="gallery-display-stage">
          {activeCategory === 'all' ? (
            /* EXACT REFERENCE LAYOUT: Row 1 has 3 Wide Cards, Row 2 has 4 Cards */
            <div className="gallery-reference-layout">
              {/* Row 1: 3 Wide Landscape Cards */}
              <div className="gallery-row gallery-row-top" aria-label="Featured gallery highlights">
                {row1Items.map((item) => (
                  <article
                    key={item.id}
                    className="gallery-card card-wide"
                    onClick={() => openLightbox(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
                    aria-label={`View photo: ${item.title}`}
                  >
                    <div className="gallery-card-inner">
                      {/* Media container */}
                      <div className="gallery-card-media">
                        {item.imageSrc ? (
                          <img
                            src={item.imageSrc}
                            alt={item.title}
                            className="gallery-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="gallery-wireframe-placeholder">
                            <div className="placeholder-icon-circle">
                              <ImageIcon size={44} strokeWidth={1.5} className="placeholder-icon" />
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="gallery-hover-overlay">
                          <span className="overlay-zoom-btn">
                            <Maximize2 size={16} />
                            <span>Preview</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Row 2: 4 Standard Cards */}
              <div className="gallery-row gallery-row-bottom" aria-label="Dining & kitchen gallery">
                {row2Items.map((item) => (
                  <article
                    key={item.id}
                    className="gallery-card card-standard"
                    onClick={() => openLightbox(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
                    aria-label={`View photo: ${item.title}`}
                  >
                    <div className="gallery-card-inner">
                      {/* Media container */}
                      <div className="gallery-card-media">
                        {item.imageSrc ? (
                          <img
                            src={item.imageSrc}
                            alt={item.title}
                            className="gallery-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="gallery-wireframe-placeholder">
                            <div className="placeholder-icon-circle">
                              <ImageIcon size={38} strokeWidth={1.5} className="placeholder-icon" />
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="gallery-hover-overlay">
                          <span className="overlay-zoom-btn">
                            <Maximize2 size={16} />
                            <span>Preview</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Dynamic Additional Photos Grid (Rendered when admin adds more photos) */}
              {remainingItems.length > 0 && (
                <div className="gallery-filtered-grid" style={{ marginTop: '24px' }}>
                  {remainingItems.map((item) => (
                    <article
                      key={item.id}
                      className="gallery-card"
                      onClick={() => openLightbox(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
                      aria-label={`View photo: ${item.title}`}
                    >
                      <div className="gallery-card-inner">
                        <div className="gallery-card-media">
                          {item.imageSrc ? (
                            <img
                              src={item.imageSrc}
                              alt={item.title}
                              className="gallery-card-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="gallery-wireframe-placeholder">
                              <div className="placeholder-icon-circle">
                                <ImageIcon size={38} strokeWidth={1.5} className="placeholder-icon" />
                              </div>
                            </div>
                          )}
                          <div className="gallery-hover-overlay">
                            <span className="overlay-zoom-btn">
                              <Maximize2 size={16} />
                              <span>Preview</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Filtered Category Responsive Grid */
            <div className="gallery-filtered-grid">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="gallery-card"
                  onClick={() => openLightbox(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
                  aria-label={`View photo: ${item.title}`}
                >
                  <div className="gallery-card-inner">
                    <div className="gallery-card-media">
                      {item.imageSrc ? (
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="gallery-card-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="gallery-wireframe-placeholder">
                          <div className="placeholder-icon-circle">
                            <ImageIcon size={40} strokeWidth={1.5} className="placeholder-icon" />
                          </div>
                        </div>
                      )}

                      <div className="gallery-hover-overlay">
                        <span className="overlay-zoom-btn">
                          <Maximize2 size={16} />
                          <span>Preview</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* Bottom Dining Experience Call-to-Action */}
        <section className="gallery-experience-cta" aria-label="Visit us">
          <div className="experience-cta-content">
            <h2 className="experience-cta-title">Taste These Flavours in Person</h2>
            <p className="experience-cta-desc">
              Nothing compares to the aroma of fresh dosas and sambar served piping hot in Sakhar Peth, Solapur.
            </p>
            <div className="experience-cta-actions">
              <a href="#popular-dishes" className="gallery-cta-btn-primary">
                <Utensils size={16} />
                <span>Explore Menu</span>
              </a>
              <a
                href={siteConfig.footer.visitUs.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-cta-btn-secondary"
              >
                <MapPin size={16} />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {currentLightboxItem && (
        <div
          className="gallery-lightbox-backdrop"
          onClick={() => setActiveLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={currentLightboxItem.title}
        >
          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveLightboxIndex(null)}
              aria-label="Close photo preview"
            >
              <X size={20} />
            </button>

            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav-btn prev-btn"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev > 0 ? prev - 1 : filteredItems.length - 1) : null
                    )
                  }
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="lightbox-nav-btn next-btn"
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev < filteredItems.length - 1 ? prev + 1 : 0) : null
                    )
                  }
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Main Lightbox View */}
            <div className="lightbox-image-stage">
              {currentLightboxItem.imageSrc ? (
                <img
                  src={currentLightboxItem.imageSrc}
                  alt=""
                  className="lightbox-img"
                />
              ) : (
                <div className="lightbox-placeholder-card">
                  <div className="lightbox-icon-circle">
                    <ImageIcon size={64} strokeWidth={1.4} className="placeholder-icon" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


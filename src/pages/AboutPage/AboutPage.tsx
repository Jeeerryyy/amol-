import React, { useEffect } from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../../components/common/PlaceholderImage';
import { BotanicalLeaf } from '../../components/common/BotanicalLeaf';
import { Wind, Users, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  const { aboutPage } = siteConfig;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const amenities = [
    {
      id: 'ac',
      title: 'Air-Conditioned Dining Hall',
      subtitle: 'Comfortable climate-controlled ambiance',
      icon: Wind,
    },
    {
      id: 'family',
      title: 'Spacious Family Seating',
      subtitle: 'Dedicated comfortable seating for families',
      icon: Users,
    },
    {
      id: 'hygiene',
      title: 'Spotless Hygiene Standards',
      subtitle: 'Strict daily sanitization and pure cooking',
      icon: Sparkles,
    },
    {
      id: 'takeaway',
      title: 'Quick Takeaway & Parcel Counter',
      subtitle: 'Piping-hot meals packed swiftly to go',
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="about-subpage" id="about-subpage">
      {/* ============================================================ */}
      {/* SECTION 1: Full-Screen Storefront Sketch (Edge-to-Edge)      */}
      {/* ============================================================ */}
      <section className="about-sketch-stage" aria-label="Amol Veg Resto Storefront Illustration">
        <div className="about-sketch-full-wrap">
          <img
            src={aboutPage.hero.sketchSrc}
            alt={aboutPage.hero.sketchAlt}
            className="about-sketch-full-img"
            loading="eager"
          />
        </div>
      </section>

      {/* Decorative Botanical Leaf Accent */}
      <BotanicalLeaf position="bottom-right" width={230} opacity={0.88} />

      {/* ============================================================ */}
      {/* SECTION 2: Story Intro & Redesigned Heritage Stats Plaque    */}
      {/* ============================================================ */}
      <section className="about-intro-section" aria-label="About Amol Veg Resto">
        <BotanicalLeaf
          position="custom"
          width={180}
          opacity={0.82}
          style={{ top: '-10px', left: '0' }}
        />

        <div className="container about-intro-container">
          {/* Story Heading & Description */}
          <div className="about-hero-text-block">
            <div className="about-eyebrow-wrap center">
              <span className="about-eyebrow-text">{aboutPage.hero.eyebrow}</span>
              <div className="about-eyebrow-rule" aria-hidden="true" />
            </div>

            <h1 className="about-hero-title">
              {aboutPage.hero.heading.prefix}{' '}
              <span className="text-orange">{aboutPage.hero.heading.highlight}</span>
            </h1>

            <div className="about-hero-desc-wrap">
              <p className="about-hero-desc">{aboutPage.hero.description}</p>
            </div>
          </div>

          {/* Redesigned Heritage Stats Plaque matching warm Solapuri restaurant vibe */}
          <div className="about-stats-plaque" aria-label="Restaurant Highlights & Heritage">
            {aboutPage.stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <div className="about-stat-col">
                  <span className="stat-number">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                {i < aboutPage.stats.length - 1 && (
                  <div className="stat-divider-line" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTAINER: Remaining Content Sections                   */}
      {/* ============================================================ */}
      <div className="container about-page-container">
        {/* ============================================================ */}
        {/* SECTION 3: From Our Owner (Arch Photo + Quote Card)           */}
        {/* ============================================================ */}
        <section className="about-owner-block" aria-label="From Our Owner">
          {/* Left Column: Cathedral Arch Photo Card */}
          <div className="about-owner-media-col">
            <div className="about-arch-wrapper">
              {/* Offset circular backdrop */}
              <div className="about-arch-backdrop-disc" aria-hidden="true" />
              {/* Arch card */}
              <div className="about-arch-card">
                <PlaceholderImage
                  label={aboutPage.owner.image.label}
                  width="100%"
                  height="100%"
                  borderRadius="140px 140px 24px 24px"
                  className="about-owner-placeholder"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Heading, Narrative & Elevated Quote */}
          <div className="about-owner-content-col">
            <div className="about-eyebrow-wrap">
              <span className="about-eyebrow-text">{aboutPage.owner.eyebrow}</span>
              <div className="about-eyebrow-rule" aria-hidden="true" />
            </div>

            <h2 className="about-owner-heading">
              {aboutPage.owner.heading.prefix}{' '}
              <span className="text-orange">{aboutPage.owner.heading.highlight}</span>
            </h2>

            <p className="about-owner-narrative">{aboutPage.owner.narrative}</p>

            {/* Elevated Quote Card */}
            <div className="about-quote-card">
              <div className="about-quote-glyph" aria-hidden="true">
                “
              </div>
              <p className="about-quote-text">{aboutPage.owner.quote}</p>
              <div className="about-quote-author">— {aboutPage.owner.author}</div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: Our Space (Dine in Comfort & Redesigned Amenities) */}
        {/* ============================================================ */}
        <section className="about-space-block" aria-label="Our Dining Space">
          {/* Left Column: Overlapping Dual Photo Stack */}
          <div className="about-space-media-col">
            <div className="about-space-stack">
              {/* Decorative delicate outline arc */}
              <div className="about-space-decor-arc" aria-hidden="true">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <path
                    d="M 10 110 C 10 50, 50 10, 110 10"
                    stroke="#C85A17"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.45"
                  />
                </svg>
              </div>

              {/* Main Primary Image Card */}
              <div className="space-primary-card">
                <PlaceholderImage
                  label={aboutPage.space.mainImage.label}
                  width="100%"
                  height="100%"
                  borderRadius="24px"
                  className="space-primary-placeholder"
                />
              </div>

              {/* Secondary Overlapping Card */}
              <div className="space-secondary-card">
                <PlaceholderImage
                  label={aboutPage.space.secondaryImage.label}
                  width="100%"
                  height="100%"
                  borderRadius="20px"
                  className="space-secondary-placeholder"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Heading, Description & Hospitality Amenities */}
          <div className="about-space-content-col">
            <div className="about-eyebrow-wrap">
              <span className="about-eyebrow-text">{aboutPage.space.eyebrow}</span>
              <div className="about-eyebrow-rule" aria-hidden="true" />
            </div>

            <h2 className="about-space-heading">
              {aboutPage.space.heading.prefix}{' '}
              <span className="text-orange">{aboutPage.space.heading.highlight}</span>
            </h2>

            <p className="about-space-desc">{aboutPage.space.paragraph}</p>

            {/* Redesigned Hospitality Amenities Grid matching brand design */}
            <div className="about-amenities-hospitality-grid">
              {amenities.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.id} className="amenity-hospitality-card">
                    <div className="amenity-hospitality-badge" aria-hidden="true">
                      <IconComponent size={20} color="#C85A17" strokeWidth={2} />
                    </div>
                    <div className="amenity-hospitality-text">
                      <h3 className="amenity-hospitality-title">{item.title}</h3>
                      <p className="amenity-hospitality-sub">{item.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5: Warm Hospitality & Visit CTA Card                 */}
        {/* ============================================================ */}
        <section className="about-visit-cta" aria-label="Visit Amol Veg Resto">
          <div className="cta-inner-card">
            <h3 className="cta-heading">{aboutPage.visitCta.heading}</h3>
            <p className="cta-desc">{aboutPage.visitCta.description}</p>
            <div className="cta-buttons-row">
              <a href={aboutPage.visitCta.menuBtnHref} className="cta-btn cta-btn-primary">
                <span>{aboutPage.visitCta.menuBtnText}</span>
              </a>
              <a href={aboutPage.visitCta.contactBtnHref} className="cta-btn cta-btn-secondary">
                <span>{aboutPage.visitCta.contactBtnText}</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

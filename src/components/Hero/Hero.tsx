import React from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  const { hero } = siteConfig;

  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Left Column: Authentic Flavours Feel Like Home */}
        <div className="hero-col hero-col-left">
          <span className="hero-eyebrow">{hero.leftEyebrow}</span>
          <h1 className="hero-title">
            <span className="hero-title-line">{hero.heading.line1}</span>
            <span className="hero-title-line text-orange">{hero.heading.line2}</span>
            <span className="hero-title-line">{hero.heading.line3}</span>
          </h1>
          <span className="hero-subtag">{hero.subtag}</span>
        </div>

        {/* Center Column: Table Spread Placeholder */}
        <div className="hero-col hero-col-center">
          <div className="hero-placeholder-wrapper">
            <PlaceholderImage
              label={hero.heroImage.label}
              height="460px"
              borderRadius="var(--radius-lg)"
              className="hero-image-placeholder"
            />
          </div>
        </div>

        {/* Right Column: Good Food Brings People Together */}
        <div className="hero-col hero-col-right">
          <span className="hero-eyebrow right-eyebrow">{hero.rightEyebrow}</span>

          <h2 className="hero-right-heading">
            {hero.rightHeadingLines.map((line, i) => (
              <span key={i} className="hero-right-line">{line}</span>
            ))}
          </h2>

          <div className="hero-orange-rule" aria-hidden="true" />

          <span className="hero-heritage">{hero.rightHeritage}</span>

          <a href={hero.exploreMenuButton.href} className="hero-explore-btn">
            <span className="explore-text">{hero.exploreMenuButton.text}</span>
            <span className="explore-icon-circle">
              <ArrowRight size={16} strokeWidth={2.4} color="var(--color-accent-orange)" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};


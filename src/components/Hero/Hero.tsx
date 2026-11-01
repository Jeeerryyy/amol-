import React from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  const { hero } = siteConfig;

  return (
    <section className="hero-section" id="hero">
      {/* Full Hero Background Layer */}
      <div className="hero-background-layer" aria-hidden="true">
        <PlaceholderImage
          label={hero.heroImage.label}
          width="100%"
          height="100%"
          borderRadius="0"
          className="hero-bg-placeholder"
        />
        <div className="hero-bg-overlay" />
      </div>

      <div className="container hero-container">
        {/* Left Content: Authentic Flavours Feel Like Home */}
        <div className="hero-col hero-col-left">
          <span className="hero-eyebrow">{hero.leftEyebrow}</span>
          <h1 className="hero-title">
            <span className="hero-title-line">{hero.heading.line1}</span>
            <span className="hero-title-line text-orange">{hero.heading.line2}</span>
            <span className="hero-title-line">{hero.heading.line3}</span>
          </h1>
          <span className="hero-subtag">{hero.subtag}</span>
        </div>

        {/* Right Content: Good Food Brings People Together */}
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
              <ArrowRight size={16} strokeWidth={2.4} className="explore-arrow-icon" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};


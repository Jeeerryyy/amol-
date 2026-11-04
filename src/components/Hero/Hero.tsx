import React from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  const { hero } = siteConfig;

  return (
    <section className="hero-section" id="hero">
      {/* DESKTOP VIEW (>900px) - COMPLETELY UNTOUCHED */}
      <div className="hero-desktop-content">
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
      </div>

      {/* MOBILE & TABLET VIEW (<=900px) - MATCHES USER SPECIFICATION */}
      <div className="hero-mobile-content">
        {/* Top Dish Image with Curved Wave Divider */}
        <div className="hero-mobile-image-wrap">
          <img
            src="/images/hero-mobile-dish.jpg"
            alt="Amol Veg Resto Specialty Cuisine"
            className="hero-mobile-img"
          />
          <div className="hero-mobile-wave-wrap" aria-hidden="true">
            <svg
              viewBox="0 0 621 95"
              preserveAspectRatio="none"
              className="hero-mobile-wave-svg"
            >
              <path
                d="M 0,28 C 120,70 210,83 270,83 C 350,83 450,50 621,0 L 621,95 L 0,95 Z"
                fill="#FAF4EC"
              />
            </svg>
          </div>
        </div>

        {/* Content Body */}
        <div className="hero-mobile-body">
          {/* Subtle Corner Leaves */}
          <div className="hero-mobile-leaf-decor hero-leaf-left" aria-hidden="true">
            <img src="/images/botanical-leaf.png" alt="" />
          </div>
          <div className="hero-mobile-leaf-decor hero-leaf-right" aria-hidden="true">
            <img src="/images/botanical-leaf.png" alt="" />
          </div>

          {/* Eyebrow flanked by rules */}
          <div className="hero-mobile-eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            <span className="eyebrow-text">{hero.leftEyebrow || "PURE VEG. PURE TASTE."}</span>
            <span className="eyebrow-line" aria-hidden="true" />
          </div>

          {/* Main Title */}
          <h1 className="hero-mobile-title">
            <span>{hero.heading.line1} </span>
            <span className="hero-mobile-highlight">{hero.heading.line2}</span>
            <br />
            <span>{hero.heading.line3}</span>
            <svg
              className="hero-mobile-leaf-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C85A17"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </h1>

          {/* Subtag */}
          <p className="hero-mobile-subtag">{hero.subtag || "ALWAYS AMOL."}</p>

          {/* Single Focused CTA to Menu */}
          <a href={hero.exploreMenuButton.href || "/menu/"} className="hero-mobile-cta-btn">
            <span>EXPLORE FULL MENU</span>
            <ArrowRight size={18} strokeWidth={2.6} />
          </a>
        </div>
      </div>
    </section>
  );
};

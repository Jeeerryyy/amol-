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

      {/* MOBILE & TABLET VIEW (<=900px) - PLACEHOLDER AS DESKTOP VIEW */}
      <div className="hero-mobile-content">
        {/* Top Image / Placeholder Container with Organic Scalloped Wave Cut */}
        <div className="hero-mobile-image-wrap">
          {hero.heroImage.src ? (
            <img
              src={hero.heroImage.src}
              alt={hero.heroImage.label || 'Amol Veg Resto Featured Dish'}
              className="hero-mobile-photo"
            />
          ) : (
            <PlaceholderImage
              label={hero.heroImage.label}
              width="100%"
              height="100%"
              borderRadius="0"
              className="hero-mobile-placeholder"
            />
          )}
          <div className="hero-mobile-wave-wrap" aria-hidden="true">
            <svg
              viewBox="0 0 600 75"
              preserveAspectRatio="none"
              className="hero-mobile-wave-svg"
            >
              <path
                d="M 0,16 C 140,55 240,70 340,68 C 450,65 520,38 600,24 L 600,75 L 0,75 Z"
                fill="#FAF4EC"
              />
            </svg>
          </div>
        </div>

        {/* Content Body with Botanical Silhouette Accents */}
        <div className="hero-mobile-body">
          {/* Decorative Corner Leaf Watermarks */}
          <div className="hero-mobile-leaf-bg hero-mobile-leaf-left" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M5,95 C25,75 45,50 65,15 C55,35 45,48 30,58 C15,68 5,78 5,95 Z" opacity="0.85" />
              <path d="M35,68 C50,62 65,65 76,58 C66,54 52,56 40,63 Z" opacity="0.75" />
              <path d="M50,45 C65,37 78,38 90,30 C78,28 66,31 55,40 Z" opacity="0.75" />
              <path d="M65,18 C72,9 84,5 95,2 C88,11 82,16 70,21 Z" opacity="0.75" />
            </svg>
          </div>
          <div className="hero-mobile-leaf-bg hero-mobile-leaf-right" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M95,95 C75,75 55,50 35,15 C45,35 55,48 70,58 C85,68 95,78 95,95 Z" opacity="0.85" />
              <path d="M65,68 C50,62 35,65 24,58 C34,54 48,56 60,63 Z" opacity="0.75" />
              <path d="M50,45 C35,37 22,38 10,30 C22,28 34,31 45,40 Z" opacity="0.75" />
              <path d="M35,18 C28,9 16,5 5,2 C12,11 18,16 30,21 Z" opacity="0.75" />
            </svg>
          </div>

          {/* Eyebrow flanked by rules */}
          <div className="hero-mobile-eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            <span className="eyebrow-text">{hero.leftEyebrow || "PURE VEG. PURE TASTE."}</span>
            <span className="eyebrow-line" aria-hidden="true" />
          </div>

          {/* Main Title */}
          <h1 className="hero-mobile-title">
            <span className="hero-mobile-title-row">
              {hero.heading.line1}{' '}
              <span className="hero-mobile-highlight">{hero.heading.line2}</span>
            </span>
            <span className="hero-mobile-title-row">
              <span>{hero.heading.line3}</span>
              <svg
                className="hero-mobile-leaf-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C4511E"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 18 C6 18, 5 11, 11 6 C17 1, 21 3, 21 3 C21 3, 23 7, 18 13 C13 19, 6 18, 6 18 Z" />
                <path d="M6 18 L14 10" />
              </svg>
            </span>
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

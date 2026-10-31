import React from 'react';
import { siteConfig } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';
import './AboutSection.css';

export const AboutSection: React.FC = () => {
  const { about } = siteConfig;

  return (
    <section className="about-section" id="about">
      <div className="container about-container">
        {/* Left Column: Story Copy */}
        <div className="about-col-text">
          <span className="about-eyebrow">{about.eyebrow}</span>
          <h2 className="about-heading">
            {about.heading.prefix}{' '}
            <span className="text-orange">{about.heading.highlight}</span>
          </h2>
          <div className="about-orange-rule" aria-hidden="true" />
          <p className="about-paragraph">{about.paragraph}</p>
          <a href={about.button.href} className="about-outline-btn">
            {about.button.text}
          </a>
        </div>

        {/* Right Column: Layered Peach Card & Image Placeholder */}
        <div className="about-col-media">
          <div className="about-media-stack">
            {/* Background rotated peach card */}
            <div className="about-peach-card" aria-hidden="true" />
            {/* Front main image placeholder */}
            <div className="about-image-card">
              <PlaceholderImage
                label={about.image.label}
                height="440px"
                borderRadius="var(--radius-xl)"
                className="about-front-placeholder"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


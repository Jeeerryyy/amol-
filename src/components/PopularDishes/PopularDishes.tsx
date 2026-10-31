import React from 'react';
import { siteConfig } from '../../siteConfig';
import { SectionDivider } from '../common/SectionDivider';
import { DishCard } from './DishCard';
import './PopularDishes.css';

export const PopularDishes: React.FC = () => {
  const { popularDishes } = siteConfig;

  return (
    <section className="popular-dishes-section" id="popular-dishes">
      <div className="container">
        {/* Decorative Lotus Divider */}
        <SectionDivider />

        {/* Section Header */}
        <div className="section-header-center">
          <h2 className="section-main-heading">
            {popularDishes.heading.prefix}{' '}
            <span className="text-orange">{popularDishes.heading.highlight}</span>
          </h2>
          <p className="section-subtitle">{popularDishes.subtitle}</p>
        </div>

        {/* 4 Cards Grid */}
        <div className="dishes-grid">
          {popularDishes.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>

        {/* Footer Note with lines */}
        <div className="menu-coming-soon-note">
          <div className="note-line" aria-hidden="true" />
          <span className="note-text">{popularDishes.footerNote}</span>
          <div className="note-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

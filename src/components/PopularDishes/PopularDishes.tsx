import React, { useState, useEffect } from 'react';
import { siteConfig, DishItem } from '../../siteConfig';
import { DishCard } from './DishCard';
import { ArrowRight } from 'lucide-react';
import './PopularDishes.css';

export const PopularDishes: React.FC = () => {
  const { popularDishes } = siteConfig;
  const [dishes, setDishes] = useState<DishItem[]>(popularDishes.dishes);

  useEffect(() => {
    fetch('/api/public/popular-dishes')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DishItem[] = data.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description || '',
            price: d.price || '',
            imageSrc: d.image_url || undefined,
            placeholderText: d.title,
          }));
          setDishes(mapped);
        }
      })
      .catch((err) => {
        // Fall back gracefully to bundled siteConfig dishes
        console.warn('[PopularDishes] Using bundled fallback dishes:', err);
      });
  }, []);

  return (
    <section className="popular-dishes-section" id="popular-dishes">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-center">
          <h2 className="section-main-heading">
            {popularDishes.heading.prefix}{' '}
            <span className="text-orange">{popularDishes.heading.highlight}</span>
          </h2>
          <p className="section-subtitle">{popularDishes.subtitle}</p>
        </div>

        {/* Cards Grid */}
        <div className="dishes-grid">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>

        {/* Full Menu CTA Button */}
        <div className="view-full-menu-action">
          <a href="/menu/" className="btn-explore-digital-menu">
            <span>Explore Full Digital Menu</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

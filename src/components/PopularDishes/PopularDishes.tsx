import React, { useState, useEffect } from 'react';
import { siteConfig, DishItem } from '../../siteConfig';
import { DishCard } from './DishCard';
import { StackedDishesCarousel } from './StackedDishesCarousel';
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
          const mapped: DishItem[] = data.map((d, idx) => ({
            id: String(d.id || idx),
            title: d.title || d.name || `Special Dish ${idx + 1}`,
            description: d.description || '',
            price: typeof d.price === 'number' ? `₹${d.price}` : (d.price || ''),
            imageSrc: d.image_url || d.imageSrc || undefined,
            placeholderText: d.title || d.name || `Special Dish ${idx + 1}`,
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

        {/* Desktop Cards Grid (> 640px) */}
        <div className="dishes-grid desktop-dishes-grid">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>

        {/* Mobile Stacked Swipeable Carousel (<= 640px) */}
        <div className="mobile-dishes-carousel-wrap">
          <StackedDishesCarousel dishes={dishes} />
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

import React, { useState, useEffect } from 'react';
import { siteConfig, DishItem } from '../../siteConfig';
import { DishCard } from './DishCard';
import { StackedDishesCarousel } from './StackedDishesCarousel';
import { ArrowRight } from 'lucide-react';
import './PopularDishes.css';

export const PopularDishes: React.FC = () => {
  const { popularDishes } = siteConfig;
  const [dishes, setDishes] = useState<DishItem[]>(popularDishes.dishes);
  const [header, setHeader] = useState({
    prefix: popularDishes.heading.prefix,
    highlight: popularDishes.heading.highlight,
    subtitle: popularDishes.subtitle,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [resDishes, resSite] = await Promise.all([
          fetch(`/api/public/popular-dishes?_t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/public/site?_t=${Date.now()}`, { cache: 'no-store' }),
        ]);

        if (resDishes.ok) {
          const data = await resDishes.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
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
        }

        if (resSite.ok) {
          const site = await resSite.json();
          const popHeader = site?.content?.popular_header;
          if (popHeader && isMounted) {
            setHeader({
              prefix: popHeader.prefix !== undefined ? popHeader.prefix : popularDishes.heading.prefix,
              highlight: popHeader.highlight !== undefined ? popHeader.highlight : popularDishes.heading.highlight,
              subtitle: popHeader.subtitle !== undefined ? popHeader.subtitle : popularDishes.subtitle,
            });
          }
        }
      } catch (err) {
        // Fall back gracefully to bundled siteConfig dishes
        console.warn('[PopularDishes] Using bundled fallback data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [popularDishes]);

  return (
    <section className="popular-dishes-section" id="popular-dishes">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-center">
          <h2 className="section-main-heading">
            {header.prefix ? `${header.prefix} ` : ''}
            <span className="text-orange">{header.highlight}</span>
          </h2>
          <p className="section-subtitle">{header.subtitle}</p>
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

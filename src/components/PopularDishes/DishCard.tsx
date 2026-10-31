import React from 'react';
import { DishItem } from '../../siteConfig';
import { PlaceholderImage } from '../common/PlaceholderImage';

interface DishCardProps {
  dish: DishItem;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  return (
    <div className="dish-card" id={dish.id}>
      {/* Food Photo Placeholder / Image */}
      <div className="dish-card-media">
        {dish.imageSrc ? (
          <img src={dish.imageSrc} alt={dish.title} className="dish-img" />
        ) : (
          <PlaceholderImage
            label={dish.placeholderText || dish.title}
            height="210px"
            borderRadius="var(--radius-md) var(--radius-md) 0 0"
          />
        )}
      </div>

      {/* Card Content */}
      <div className="dish-card-content">
        <h3 className="dish-title">{dish.title}</h3>
        <p className="dish-description">{dish.description}</p>
        <span className="dish-price">{dish.price}</span>
      </div>
    </div>
  );
};


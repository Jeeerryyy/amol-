import React, { useState, useRef, useCallback } from 'react';
import { DishItem } from '../../siteConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './StackedDishesCarousel.css';

interface StackedDishesCarouselProps {
  dishes: DishItem[];
}

export const StackedDishesCarousel: React.FC<StackedDishesCarouselProps> = ({ dishes }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalGesture = useRef(false);

  const total = dishes.length;

  const handleNext = useCallback(() => {
    setFlyDirection('left');
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % total);
      setFlyDirection(null);
      setDragX(0);
    }, 220);
  }, [total]);

  const handlePrev = useCallback(() => {
    setFlyDirection('right');
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + total) % total);
      setFlyDirection(null);
      setDragX(0);
    }, 220);
  }, [total]);

  // Pointer event handlers for fluid touch & drag
  const onPointerDown = (e: React.PointerEvent) => {
    if (flyDirection) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isHorizontalGesture.current = false;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (!isHorizontalGesture.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalGesture.current = true;
      }
    }

    if (isHorizontalGesture.current) {
      setDragX(deltaX);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }

    const threshold = 55;
    if (dragX < -threshold) {
      handleNext();
    } else if (dragX > threshold) {
      handlePrev();
    } else {
      // Spring back
      setDragX(0);
    }
  };

  return (
    <div className="stacked-carousel-container" aria-label="Popular Dishes Stacked Carousel">
      {/* Cards Stack Stage */}
      <div
        className="stacked-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {dishes.map((dish, index) => {
          const offset = (index - activeIndex + total) % total;

          // Only keep cards in the visible stack window (top 4)
          if (offset >= 4) return null;

          const isTop = offset === 0;
          let transformStyle = '';
          let opacityStyle = 1;
          let transitionStyle = isDragging && isTop ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';

          if (isTop) {
            if (flyDirection === 'left') {
              transformStyle = 'translate3d(-125%, 0, 0) rotate(-14deg)';
              opacityStyle = 0;
            } else if (flyDirection === 'right') {
              transformStyle = 'translate3d(125%, 0, 0) rotate(14deg)';
              opacityStyle = 0;
            } else if (isDragging) {
              const rot = dragX * 0.05;
              transformStyle = `translate3d(${dragX}px, 0, 0) rotate(${rot}deg)`;
              opacityStyle = 1;
            } else {
              transformStyle = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
              opacityStyle = 1;
            }
          } else if (offset === 1) {
            const dragProgress = Math.min(Math.abs(dragX) / 120, 1);
            const scale = 0.94 + 0.06 * dragProgress;
            const translateY = 14 - 14 * dragProgress;
            transformStyle = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            opacityStyle = 0.88 + 0.12 * dragProgress;
          } else if (offset === 2) {
            transformStyle = 'translate3d(0, 26px, 0) scale(0.88)';
            opacityStyle = 0.72;
          } else {
            transformStyle = 'translate3d(0, 36px, 0) scale(0.82)';
            opacityStyle = 0.52;
          }

          const zIndex = 10 - offset;

          return (
            <div
              key={dish.id}
              className={`stacked-card ${isTop ? 'active-card' : ''}`}
              style={{
                transform: transformStyle,
                opacity: opacityStyle,
                zIndex,
                transition: transitionStyle,
              }}
            >
              {/* Dish Photo */}
              <div className="stacked-card-media">
                <img
                  src={dish.imageSrc || `/images/dishes/popular/dish-${(index % 4) + 1}.jpg`}
                  alt={dish.title || dish.placeholderText || `Special Vegetarian Dish ${index + 1}`}
                  className="stacked-card-img"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dish-placeholder.svg';
                  }}
                />
                <span className="stacked-card-badge">Pure Veg</span>
              </div>

              {/* Dish Details */}
              <div className="stacked-card-body">
                <div className="stacked-card-header">
                  <h3 className="stacked-dish-title">{dish.title}</h3>
                  <span className="stacked-dish-price">{dish.price}</span>
                </div>
                <p className="stacked-dish-desc">{dish.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe Hint */}
      <div className="stacked-swipe-hint" aria-hidden="true">
        <span>← Swipe card to explore dishes →</span>
      </div>

      {/* Controls & Pagination Dots */}
      <div className="stacked-controls-row">
        <button
          type="button"
          className="stacked-nav-btn btn-prev"
          onClick={handlePrev}
          aria-label="Previous dish"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>

        <div className="stacked-dots" role="tablist" aria-label="Dishes pagination">
          {dishes.map((d, i) => (
            <button
              key={d.id}
              type="button"
              className={`stacked-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => {
                setActiveIndex(i);
                setDragX(0);
              }}
              aria-label={`Go to ${d.title || d.placeholderText || `Dish ${i + 1}`}`}
              aria-selected={i === activeIndex}
              role="tab"
            />
          ))}
        </div>

        <button
          type="button"
          className="stacked-nav-btn btn-next"
          onClick={handleNext}
          aria-label="Next dish"
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};

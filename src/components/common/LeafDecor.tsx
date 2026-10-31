import React from 'react';

interface LeafDecorProps {
  position?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Olive botanical leaf sprig decoration shown in the Hero and Footer areas.
 */
export const LeafDecor: React.FC<LeafDecorProps> = ({
  position = 'left',
  className = '',
  style = {},
}) => {
  const isRight = position === 'right';

  return (
    <div
      className={`leaf-decor leaf-${position} ${className}`}
      style={{
        width: '56px',
        height: '56px',
        opacity: 0.85,
        transform: isRight ? 'scaleX(-1) rotate(15deg)' : 'rotate(0deg)',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        stroke="var(--color-olive-leaf)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Curved stem */}
        <path d="M12 50 C 25 40, 38 28, 48 10" />
        {/* Leaf pairs */}
        <path d="M48 10 C 44 6, 36 6, 34 11 C 32 16, 40 18, 48 10 Z" fill="rgba(107, 122, 58, 0.15)" />
        <path d="M38 22 C 30 18, 24 22, 26 28 C 28 32, 35 30, 38 22 Z" fill="rgba(107, 122, 58, 0.15)" />
        <path d="M43 23 C 49 19, 56 21, 55 27 C 54 32, 47 31, 43 23 Z" fill="rgba(107, 122, 58, 0.15)" />
        <path d="M28 35 C 20 32, 16 38, 19 43 C 22 47, 28 42, 28 35 Z" fill="rgba(107, 122, 58, 0.15)" />
        <path d="M32 36 C 38 33, 44 37, 43 43 C 41 47, 36 44, 32 36 Z" fill="rgba(107, 122, 58, 0.15)" />
      </svg>
    </div>
  );
};

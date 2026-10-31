import React from 'react';

interface SectionDividerProps {
  className?: string;
}

/**
 * Centered decorative lotus divider with horizontal hairline rules.
 * Seen above "Our Popular Dishes" and "What Our Guests Say".
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`section-divider ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        margin: '0 auto 24px auto',
        maxWidth: '300px',
      }}
    >
      {/* Left hairline rule */}
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--color-border)',
        }}
      />

      {/* Lotus line icon */}
      <svg
        width="26"
        height="22"
        viewBox="0 0 26 22"
        fill="none"
        stroke="var(--color-accent-orange)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        {/* Center petal */}
        <path d="M13 2C13 2 10.5 7 10.5 12C10.5 16 13 19 13 19C13 19 15.5 16 15.5 12C15.5 7 13 2 13 2Z" />
        {/* Left inner petal */}
        <path d="M11 9C11 9 7 10.5 6 14C5 17 8 19 10 19" />
        {/* Right inner petal */}
        <path d="M15 9C15 9 19 10.5 20 14C21 17 18 19 16 19" />
        {/* Outer base leaves */}
        <path d="M3 16C5 18 8 19 13 19C18 19 21 18 23 16" />
      </svg>

      {/* Right hairline rule */}
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--color-border)',
        }}
      />
    </div>
  );
};

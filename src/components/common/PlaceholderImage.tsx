import React from 'react';

interface PlaceholderImageProps {
  label?: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable placeholder box matching the grey/beige placeholder tiles in the design.
 * Shows a centered SVG image icon and optional helper label.
 */
export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  label,
  width = '100%',
  height = '100%',
  aspectRatio,
  borderRadius = 'var(--radius-md)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`placeholder-image ${className}`}
      style={{
        width,
        height,
        aspectRatio,
        borderRadius,
        backgroundColor: 'var(--color-placeholder-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--color-placeholder-icon)',
        userSelect: 'none',
        ...style,
      }}
      title={label || 'Image Placeholder'}
    >
      {/* Centered subtle landscape/image icon */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.7 }}
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      {label && (
        <span
          style={{
            marginTop: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.05em',
            opacity: 0.65,
            textAlign: 'center',
            padding: '0 8px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};


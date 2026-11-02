import React from 'react';
import './BotanicalLeaf.css';

export interface BotanicalLeafProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  width?: number | string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  flipH?: boolean;
  flipV?: boolean;
  rotation?: number;
}

export const BotanicalLeaf: React.FC<BotanicalLeafProps> = ({
  position = 'top-left',
  width = 180,
  opacity = 0.92,
  className = '',
  style,
  flipH,
  flipV,
  rotation,
}) => {
  const positionClass = position !== 'custom' ? `leaf-pos-${position}` : '';

  // Calculate transform overrides if explicit props provided
  let transform = '';
  if (rotation !== undefined) {
    transform += ` rotate(${rotation}deg)`;
  }
  if (flipH) {
    transform += ` scaleX(-1)`;
  }
  if (flipV) {
    transform += ` scaleY(-1)`;
  }

  const customStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    opacity,
    ...(transform ? { transform } : {}),
    ...style,
  };

  return (
    <div
      className={`botanical-leaf-wrapper ${positionClass} ${className}`.trim()}
      aria-hidden="true"
      style={customStyle}
    >
      <img
        src="/images/botanical-leaf.png"
        alt=""
        className="botanical-leaf-img"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};


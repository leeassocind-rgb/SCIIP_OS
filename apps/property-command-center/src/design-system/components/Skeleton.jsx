import React from 'react';

export default function Skeleton({ width = '100%', height = 16, radius, className = '' }) {
  return (
    <div
      className={`sciip-skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius
      }}
    />
  );
}

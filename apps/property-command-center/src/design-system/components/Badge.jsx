import React from 'react';

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`sciip-badge sciip-badge--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}

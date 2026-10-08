import React from 'react';

export default function Stack({ children, gap = 'var(--sciip-space-4)', className = '' }) {
  return (
    <div
      className={`sciip-stack ${className}`.trim()}
      style={{ '--sciip-stack-gap': gap }}
    >
      {children}
    </div>
  );
}

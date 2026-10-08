import React from 'react';

export default function Cluster({ children, gap = 'var(--sciip-space-3)', className = '' }) {
  return (
    <div
      className={`sciip-cluster ${className}`.trim()}
      style={{ '--sciip-cluster-gap': gap }}
    >
      {children}
    </div>
  );
}

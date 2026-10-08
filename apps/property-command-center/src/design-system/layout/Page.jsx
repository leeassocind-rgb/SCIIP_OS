import React from 'react';

export default function Page({ children, className = '' }) {
  return <main className={`sciip-page sciip-ds-root ${className}`.trim()}>{children}</main>;
}

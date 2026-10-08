import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <section className="sciip-empty-state">
      <div>
        {icon && <div className="sciip-empty-state__icon">{icon}</div>}
        <h2>{title}</h2>
        {description && <p className="sciip-subtitle">{description}</p>}
        {action && <div style={{ marginTop: 'var(--sciip-space-4)' }}>{action}</div>}
      </div>
    </section>
  );
}

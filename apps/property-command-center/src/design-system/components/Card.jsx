import React from 'react';

export default function Card({ title, meta, children, footer, className = '' }) {
  return (
    <section className={`sciip-card ${className}`.trim()}>
      {(title || meta) && (
        <header className="sciip-card__header">
          {title && <h2 className="sciip-card__title">{title}</h2>}
          {meta && <p className="sciip-card__meta">{meta}</p>}
        </header>
      )}
      <div className="sciip-card__body">{children}</div>
      {footer && <footer className="sciip-card__footer">{footer}</footer>}
    </section>
  );
}

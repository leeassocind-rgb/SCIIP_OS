import React from 'react';

const content = Object.freeze({
  Assignments: ['Active assignments','Assignment changes','Client preparation'],
  Explorer: ['Property search','Property comparison','Property evidence'],
  Map: ['Explorer','Requirements','Comparables'],
  Timeline: ['Market events','Assignment activity','Decision history'],
  Search: ['Explorer','Companies','Documents'],
  Copilot: ['Ask what changed','Explain recommendations','Prepare client work']
});

export default function ProductPlaceholder({ destination }) {
  const items = content[destination] || [];
  return (
    <section className="product-page product-placeholder">
      <p className="sciip-kicker">SCIIP Product</p>
      <h1>{destination}</h1>
      <p>
        This destination now represents the broker-facing product experience.
        Technical workspaces remain hidden behind the advanced layer.
      </p>
      <div className="product-placeholder-grid">
        {items.map((item, index) => (
          <button type="button" className="product-placeholder-card" key={item}>
            <span>{String(index + 1).padStart(2,'0')}</span>
            <h3>{item}</h3>
            <small>Open workflow</small>
          </button>
        ))}
      </div>
    </section>
  );
}

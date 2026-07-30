
import React, { useMemo, useState } from 'react';

const tabs = ['Executive','Digital Twin','Knowledge Graph','GIS Studio','Market Intelligence'];

export default function ExecutiveIntelligencePlatform({ data = {} }) {
  const [active, setActive] = useState('Executive');
  const [query, setQuery] = useState('');
  const kpis = useMemo(() => data.kpis || [
    { label: 'Properties', value: data.properties ?? '—' },
    { label: 'Evidence Relationships', value: data.relationships ?? '—' },
    { label: 'Pending Decisions', value: data.pendingDecisions ?? 0 },
    { label: 'Human Approval', value: 'Required' },
  ], [data]);

  return (
    <section className="sciip-v56-shell" aria-label="SCIIP OS v5.6 Executive Intelligence Platform">
      <header className="sciip-v56-header">
        <div>
          <p className="eyebrow">SCIIP_OS v5.6</p>
          <h1>Executive Intelligence Platform</h1>
        </div>
        <input
          aria-label="Global command palette"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search properties, markets, evidence, or commands…"
        />
      </header>
      <nav aria-label="Intelligence workspaces">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActive(tab)} aria-pressed={active === tab}>{tab}</button>
        ))}
      </nav>
      <div className="sciip-v56-kpi-grid">
        {kpis.map(k => <article key={k.label}><span>{k.label}</span><strong>{k.value}</strong></article>)}
      </div>
      <div className="sciip-v56-main-grid">
        <article>
          <h2>{active}</h2>
          <p>{query ? `Filtered by “${query}”` : 'Evidence-governed intelligence workspace ready.'}</p>
        </article>
        <aside>
          <h2>Decision Governance</h2>
          <p>Recommendations remain explainable, duplicate-safe, and subject to human approval.</p>
        </aside>
      </div>
    </section>
  );
}

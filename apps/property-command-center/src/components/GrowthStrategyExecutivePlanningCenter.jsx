import React from 'react';
import { TrendingUp, MapPinned, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';

export default function GrowthStrategyExecutivePlanningCenter() {
  return <section className="production-activation-center">
    <header className="production-activation-hero">
      <div>
        <p>Phase 17 Growth Strategy</p>
        <h1>Growth Strategy & Executive Planning Center</h1>
        <p>Strategic accounts, territory expansion, pipeline scenarios, capacity planning, and executive growth command.</p>
      </div>
      <span className="production-activation-badge">GROWTH GOVERNANCE ACTIVE</span>
    </header>

    <section className="production-kpis">
      <article><span>Strategic accounts</span><strong>PRIORITIZED</strong></article>
      <article><span>Territories</span><strong>RANKED</strong></article>
      <article><span>Scenarios</span><strong>MODELED</strong></article>
      <article><span>Autonomous execution</span><strong>OFF</strong></article>
    </section>

    <div className="production-grid">
      <main className="production-panel">
        <header><TrendingUp size={17}/><h2>Growth planning</h2></header>
        <div className="production-row">
          <span><strong>Territory expansion</strong><small>Evidence-backed and executive approved.</small></span>
          <MapPinned size={16}/>
        </div>
        <div className="production-row">
          <span><strong>Pipeline scenarios</strong><small>Transparent assumptions and outcomes.</small></span>
          <ChartNoAxesCombined size={16}/>
        </div>
      </main>

      <aside className="production-panel">
        <header><ShieldCheck size={17}/><h2>Executive controls</h2></header>
        <div className="production-row"><span><strong>Evidence</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Autonomous execution</strong><small>Disabled</small></span></div>
      </aside>
    </div>
  </section>;
}

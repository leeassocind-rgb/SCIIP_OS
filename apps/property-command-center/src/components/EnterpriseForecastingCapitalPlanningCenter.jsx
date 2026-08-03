import React from 'react';
import { ChartNoAxesCombined, Landmark, GitBranch, ShieldCheck } from 'lucide-react';

export default function EnterpriseForecastingCapitalPlanningCenter() {
  return <section className="production-activation-center">
    <header className="production-activation-hero">
      <div>
        <p>Phase 17 Enterprise Planning</p>
        <h1>Enterprise Forecasting & Capital Planning Center</h1>
        <p>Forecasts, capital allocation, scenario simulation, executive decision support, and strategic planning command.</p>
      </div>
      <span className="production-activation-badge">CAPITAL GOVERNANCE ACTIVE</span>
    </header>

    <section className="production-kpis">
      <article><span>Forecasts</span><strong>MODELED</strong></article>
      <article><span>Capital plans</span><strong>PRIORITIZED</strong></article>
      <article><span>Scenarios</span><strong>SIMULATED</strong></article>
      <article><span>Auto deployment</span><strong>OFF</strong></article>
    </section>

    <div className="production-grid">
      <main className="production-panel">
        <header><ChartNoAxesCombined size={17}/><h2>Enterprise planning</h2></header>
        <div className="production-row">
          <span><strong>Capital allocation</strong><small>Evidence-backed and executive approved.</small></span>
          <Landmark size={16}/>
        </div>
        <div className="production-row">
          <span><strong>Scenario simulation</strong><small>Transparent assumptions and tradeoffs.</small></span>
          <GitBranch size={16}/>
        </div>
      </main>

      <aside className="production-panel">
        <header><ShieldCheck size={17}/><h2>Planning controls</h2></header>
        <div className="production-row"><span><strong>Evidence</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Automatic capital deployment</strong><small>Disabled</small></span></div>
      </aside>
    </div>
  </section>;
}

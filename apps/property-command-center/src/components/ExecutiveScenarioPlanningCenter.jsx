import React from'react';
import{Waypoints,LineChart,Boxes,ShieldCheck}from'lucide-react';

export default function ExecutiveScenarioPlanningCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 18 Strategic Simulation</p>
    <h1>Executive Scenario Planning, Strategic Forecasting & Portfolio Simulation Center</h1>
    <p>Scenario construction, transparent forecasting, portfolio simulation, comparison, and executive review.</p>
   </div>
   <span className="production-activation-badge">SCENARIO GOVERNANCE ACTIVE</span>
  </header>

  <section className="production-kpis">
   <article><span>Scenarios</span><strong>MODELED</strong></article>
   <article><span>Forecasts</span><strong>TRANSPARENT</strong></article>
   <article><span>Portfolio</span><strong>SIMULATED</strong></article>
   <article><span>Auto selection</span><strong>OFF</strong></article>
  </section>

  <div className="production-grid">
   <main className="production-panel">
    <header><Waypoints size={17}/><h2>Executive scenario command</h2></header>
    <div className="production-row"><span><strong>Strategic forecasts</strong><small>Methodology and assumptions visible.</small></span><LineChart size={16}/></div>
    <div className="production-row"><span><strong>Portfolio simulation</strong><small>Value, margin, and risk under each scenario.</small></span><Boxes size={16}/></div>
   </main>

   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Scenario controls</h2></header>
    <div className="production-row"><span><strong>Assumptions</strong><small>Visible</small></span></div>
    <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Autonomous selection</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

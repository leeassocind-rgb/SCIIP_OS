import React from'react';
import{Landmark,UsersRound,BriefcaseBusiness,ShieldCheck}from'lucide-react';

export default function ExecutiveCapitalPlanningCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 18 Capital Planning</p>
    <h1>Strategic Capital Allocation, Resource Optimization & Investment Planning Center</h1>
    <p>Capital prioritization, resource capacity, investment portfolio planning, stress testing, and executive approval.</p>
   </div>
   <span className="production-activation-badge">CAPITAL GOVERNANCE ACTIVE</span>
  </header>

  <section className="production-kpis">
   <article><span>Capital</span><strong>ALLOCATED</strong></article>
   <article><span>Resources</span><strong>OPTIMIZED</strong></article>
   <article><span>Investments</span><strong>PRIORITIZED</strong></article>
   <article><span>Auto allocation</span><strong>OFF</strong></article>
  </section>

  <div className="production-grid">
   <main className="production-panel">
    <header><Landmark size={17}/><h2>Executive capital planning</h2></header>
    <div className="production-row"><span><strong>Resource capacity</strong><small>Demand, allocation, and constraint visibility.</small></span><UsersRound size={16}/></div>
    <div className="production-row"><span><strong>Investment portfolio</strong><small>Return, strategic fit, confidence, and risk.</small></span><BriefcaseBusiness size={16}/></div>
   </main>

   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Capital controls</h2></header>
    <div className="production-row"><span><strong>Assumptions</strong><small>Visible</small></span></div>
    <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Autonomous allocation</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

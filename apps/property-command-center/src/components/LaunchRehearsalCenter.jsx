import React from'react';
import{Activity,Clock3,Layers3,RotateCcw}from'lucide-react';

export default function LaunchRehearsalCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 14 Launch Rehearsal</p><h1>Production Launch Rehearsal Center</h1><p>Time-bounded authorization, simulated traffic stages, health gates, rollback readiness, and launch evidence.</p></div>
   <span className="production-activation-badge">LIVE TRAFFIC DISABLED</span>
  </header>
  <section className="production-kpis">
   <article><span>Authorization window</span><strong>CONTROLLED</strong></article>
   <article><span>Traffic stages</span><strong>SIMULATED</strong></article>
   <article><span>Rollback</span><strong>READY</strong></article>
   <article><span>Live traffic</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Layers3 size={17}/><h2>Traffic rehearsal</h2></header>
    <div className="production-row"><span><strong>Internal stage</strong><small>5% simulated traffic.</small></span><Activity size={16}/></div>
    <div className="production-row"><span><strong>Limited stage</strong><small>25% simulated traffic.</small></span></div>
    <div className="production-row"><span><strong>Expanded stage</strong><small>50% simulated traffic.</small></span></div>
    <div className="production-row"><span><strong>Full stage</strong><small>100% remains blocked.</small></span></div>
   </main>
   <aside className="production-panel">
    <header><Clock3 size={17}/><h2>Launch controls</h2></header>
    <div className="production-row"><span><strong>Authorization window</strong><small>Time bounded</small></span></div>
    <div className="production-row"><span><strong>Rollback plan</strong><small>Required</small></span><RotateCcw size={16}/></div>
    <div className="production-row"><span><strong>Live traffic</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

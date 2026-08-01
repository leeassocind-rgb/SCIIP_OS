import React from'react';
import{Activity,AlertTriangle,CheckCircle2,Users}from'lucide-react';

export default function PilotOperationsCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 13 Pilot Operations</p><h1>Controlled Pilot Operations Center</h1><p>Live pilot sessions, user telemetry, issue triage, dataset health, approvals, and shutdown controls.</p></div>
   <span className="production-activation-badge">PRODUCTION EXECUTION DISABLED</span>
  </header>
  <section className="production-kpis">
   <article><span>Pilot status</span><strong>CONTROLLED</strong></article>
   <article><span>Telemetry</span><strong>ACTIVE</strong></article>
   <article><span>Issue triage</span><strong>ACTIVE</strong></article>
   <article><span>Production impact</span><strong>NONE</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Activity size={17}/><h2>Pilot telemetry</h2></header>
    <div className="production-row"><span><strong>User interactions</strong><small>Tracked with success and duration.</small></span><Users size={16}/></div>
    <div className="production-row"><span><strong>Workspace activity</strong><small>Captured by pilot session.</small></span><CheckCircle2 size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><AlertTriangle size={17}/><h2>Issue triage</h2></header>
    <div className="production-row"><span><strong>Severity ranking</strong><small>Critical issues first.</small></span></div>
    <div className="production-row"><span><strong>Evidence required</strong><small>Every issue remains auditable.</small></span></div>
    <div className="production-row"><span><strong>Production execution</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

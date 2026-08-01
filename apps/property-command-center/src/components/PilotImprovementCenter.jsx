import React from'react';
import{Activity,BarChart3,MessageSquareText,ShieldCheck}from'lucide-react';

export default function PilotImprovementCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 13 Pilot Intelligence</p><h1>Pilot Improvement Center</h1><p>Feedback themes, adoption, workflow completion, workspace performance, issue remediation, and governed change proposals.</p></div>
   <span className="production-activation-badge">CHANGES REQUIRE APPROVAL</span>
  </header>
  <section className="production-kpis">
   <article><span>Feedback intelligence</span><strong>ACTIVE</strong></article>
   <article><span>Adoption analytics</span><strong>ACTIVE</strong></article>
   <article><span>Workflow analytics</span><strong>ACTIVE</strong></article>
   <article><span>Auto changes</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><MessageSquareText size={17}/><h2>Feedback themes</h2></header>
    <div className="production-row"><span><strong>Evidence-backed themes</strong><small>Grouped by workspace and category.</small></span><ShieldCheck size={16}/></div>
    <div className="production-row"><span><strong>Remediation priority</strong><small>Negative sentiment is escalated.</small></span><Activity size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><BarChart3 size={17}/><h2>Adoption and workflow analytics</h2></header>
    <div className="production-row"><span><strong>Active users</strong><small>Measured by governed telemetry.</small></span></div>
    <div className="production-row"><span><strong>Workflow completion</strong><small>Started, completed, and abandoned.</small></span></div>
    <div className="production-row"><span><strong>Production changes</strong><small>Approval required</small></span></div>
   </aside>
  </div>
 </section>;
}

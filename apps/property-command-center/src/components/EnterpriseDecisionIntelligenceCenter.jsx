import React from'react';
import{GitBranch,FileCheck2,Sparkles,ShieldCheck}from'lucide-react';

export default function EnterpriseDecisionIntelligenceCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 18 Decision Intelligence</p>
    <h1>Enterprise Decision Intelligence & Governed Recommendation Center</h1>
    <p>Decision graphs, evidence chains, recommendation prioritization, cross-workspace orchestration, and executive review.</p>
   </div>
   <span className="production-activation-badge">DECISION GOVERNANCE ACTIVE</span>
  </header>
  <section className="production-kpis">
   <article><span>Decision graph</span><strong>CONNECTED</strong></article>
   <article><span>Evidence</span><strong>CHAINED</strong></article>
   <article><span>Recommendations</span><strong>PRIORITIZED</strong></article>
   <article><span>Auto decision</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><GitBranch size={17}/><h2>Executive decision command</h2></header>
    <div className="production-row"><span><strong>Evidence chains</strong><small>Confidence, support, and chain of custody.</small></span><FileCheck2 size={16}/></div>
    <div className="production-row"><span><strong>Governed recommendations</strong><small>Prioritized for review, never auto-executed.</small></span><Sparkles size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Decision controls</h2></header>
    <div className="production-row"><span><strong>Evidence</strong><small>Mandatory</small></span></div>
    <div className="production-row"><span><strong>Human approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Autonomous execution</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

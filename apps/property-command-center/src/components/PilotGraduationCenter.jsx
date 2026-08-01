import React from'react';
import{BadgeCheck,GitPullRequestArrow,RotateCcw,ShieldCheck}from'lucide-react';

export default function PilotGraduationCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 13 Pilot Graduation</p><h1>Pilot Graduation Center</h1><p>Improvement approvals, release-candidate gates, certifications, user validation, rollback readiness, and graduation controls.</p></div>
   <span className="production-activation-badge">PRODUCTION DEPLOYMENT BLOCKED</span>
  </header>
  <section className="production-kpis">
   <article><span>Improvement review</span><strong>REQUIRED</strong></article>
   <article><span>Release candidate</span><strong>GOVERNED</strong></article>
   <article><span>Rollback</span><strong>READY</strong></article>
   <article><span>Production deployment</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><GitPullRequestArrow size={17}/><h2>Release-candidate gates</h2></header>
    <div className="production-row"><span><strong>Improvement proposals</strong><small>Reviewed before candidate creation.</small></span><ShieldCheck size={16}/></div>
    <div className="production-row"><span><strong>Certification suite</strong><small>All pilot gates must pass.</small></span><BadgeCheck size={16}/></div>
    <div className="production-row"><span><strong>User validation</strong><small>Required for graduation.</small></span></div>
   </main>
   <aside className="production-panel">
    <header><RotateCcw size={17}/><h2>Graduation controls</h2></header>
    <div className="production-row"><span><strong>Rollback readiness</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Pilot deployment</strong><small>Approval gated</small></span></div>
    <div className="production-row"><span><strong>Production deployment</strong><small>Blocked</small></span></div>
   </aside>
  </div>
 </section>;
}

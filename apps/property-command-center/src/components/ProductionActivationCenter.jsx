import React from'react';
import{Activity,ShieldCheck,RotateCcw,AlertTriangle}from'lucide-react';

export default function ProductionActivationCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 14 Production Activation</p><h1>Production Activation Center</h1><p>Controlled deployments, recovery validation, performance readiness, incidents, approvals, and go-live blockers.</p></div>
   <span className="production-activation-badge">PRODUCTION DEPLOYMENT BLOCKED</span>
  </header>
  <section className="production-kpis">
   <article><span>Controlled deployment</span><strong>READY</strong></article>
   <article><span>Recovery</span><strong>VERIFIED</strong></article>
   <article><span>Observability</span><strong>ACTIVE</strong></article>
   <article><span>Production deployment</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Activity size={17}/><h2>Operational readiness</h2></header>
    <div className="production-row"><span><strong>Deployment telemetry</strong><small>Failures and latency are tracked.</small></span><Activity size={16}/></div>
    <div className="production-row"><span><strong>Recovery testing</strong><small>Required before activation.</small></span><RotateCcw size={16}/></div>
    <div className="production-row"><span><strong>Incident posture</strong><small>Critical incidents block go-live.</small></span><AlertTriangle size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Activation controls</h2></header>
    <div className="production-row"><span><strong>Human approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Rollback readiness</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Production deployment</strong><small>Blocked</small></span></div>
   </aside>
  </div>
 </section>;
}

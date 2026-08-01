import React from'react';
import{Activity,CheckCircle2,Database,ShieldAlert}from'lucide-react';

export default function EnterpriseOSPilotReadinessCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 12 Pilot Readiness</p><h1>Enterprise OS Pilot Readiness</h1><p>SuperSheet activation, live Mission Control, operational alerts, data freshness, rejected records, and governance.</p></div>
   <span className="production-activation-badge">PRODUCTION EXECUTION DISABLED</span>
  </header>
  <section className="production-kpis">
   <article><span>SuperSheet activation</span><strong>READY</strong></article>
   <article><span>Mission Control</span><strong>LIVE</strong></article>
   <article><span>Operational UX</span><strong>CERTIFIED</strong></article>
   <article><span>Pilot posture</span><strong>GOVERNED</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Database size={17}/><h2>Data activation</h2></header>
    <div className="production-row"><span><strong>Identity resolution</strong><small>Required before activation.</small></span><CheckCircle2 size={16}/></div>
    <div className="production-row"><span><strong>Rejected records</strong><small>Visible with confidence and evidence.</small></span><ShieldAlert size={16}/></div>
    <div className="production-row"><span><strong>Freshness monitoring</strong><small>Stale enterprise data is surfaced.</small></span><Activity size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><ShieldAlert size={17}/><h2>Pilot controls</h2></header>
    <div className="production-row"><span><strong>Human approvals</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Policy updates</strong><small>Manual review only</small></span></div>
    <div className="production-row"><span><strong>Production execution</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

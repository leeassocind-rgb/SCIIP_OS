import React from'react';
import{Workflow,RefreshCcw,ChartNoAxesCombined,ShieldCheck}from'lucide-react';

export default function EnterpriseOperatingModelGraduationCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 17 Enterprise Operating Model</p>
    <h1>Enterprise Operating Model & Continuous Improvement Center</h1>
    <p>Operating model governance, improvement intelligence, benchmarking, executive rhythm, and Phase 17 graduation.</p>
   </div>
   <span className="production-activation-badge">PHASE 17 GRADUATION READY</span>
  </header>
  <section className="production-kpis">
   <article><span>Operating model</span><strong>DEFINED</strong></article>
   <article><span>Improvement</span><strong>CONTINUOUS</strong></article>
   <article><span>Benchmarks</span><strong>VISIBLE</strong></article>
   <article><span>Auto graduation</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Workflow size={17}/><h2>Enterprise operating model</h2></header>
    <div className="production-row"><span><strong>Continuous improvement</strong><small>Evidence-backed and human reviewed.</small></span><RefreshCcw size={16}/></div>
    <div className="production-row"><span><strong>Executive benchmarking</strong><small>Transparent targets and variance.</small></span><ChartNoAxesCombined size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Graduation controls</h2></header>
    <div className="production-row"><span><strong>Evidence</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Autonomous graduation</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

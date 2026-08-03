import React from'react';
import{DatabaseZap,GitCompareArrows,Network,ShieldCheck}from'lucide-react';

export default function LiveSuperSheetIngestionCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 18 Live Ingestion</p>
    <h1>Live SuperSheet Ingestion & Enterprise Data Certification Center</h1>
    <p>Live ingestion orchestration, cross-sheet integrity, delta processing, large-scale rehearsal, and governed enterprise data certification.</p>
   </div>
   <span className="production-activation-badge">LIVE INGESTION GOVERNANCE ACTIVE</span>
  </header>
  <section className="production-kpis">
   <article><span>SuperSheets</span><strong>ORCHESTRATED</strong></article>
   <article><span>Relationships</span><strong>VALIDATED</strong></article>
   <article><span>Delta ingestion</span><strong>IDEMPOTENT</strong></article>
   <article><span>Auto commit</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><DatabaseZap size={17}/><h2>Enterprise ingestion command</h2></header>
    <div className="production-row">
     <span><strong>Incremental ingestion</strong><small>Insert, update, unchanged, and delete plans.</small></span>
     <GitCompareArrows size={16}/>
    </div>
    <div className="production-row">
     <span><strong>Cross-sheet integrity</strong><small>Orphan detection and referential enforcement.</small></span>
     <Network size={16}/>
    </div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Ingestion controls</h2></header>
    <div className="production-row"><span><strong>Dry run</strong><small>Required first</small></span></div>
    <div className="production-row"><span><strong>Broker approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Destructive writes</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

import React from'react';
import{Database,ScanSearch,Network,ShieldCheck}from'lucide-react';

export default function ProductionCorpusIdentityGraphCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Phase 18 Production Corpus</p>
    <h1>Production Corpus, Identity & Knowledge Graph Center</h1>
    <p>Production corpus activation, canonical identity resolution, event synchronization, and knowledge-graph reconciliation.</p>
   </div>
   <span className="production-activation-badge">CORPUS GOVERNANCE ACTIVE</span>
  </header>
  <section className="production-kpis">
   <article><span>Corpus</span><strong>ACTIVATION READY</strong></article>
   <article><span>Identity</span><strong>CANONICAL</strong></article>
   <article><span>Graph</span><strong>RECONCILED</strong></article>
   <article><span>Auto mutation</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Database size={17}/><h2>Corpus activation command</h2></header>
    <div className="production-row">
     <span><strong>Canonical identity</strong><small>Duplicate detection and review queues.</small></span>
     <ScanSearch size={16}/>
    </div>
    <div className="production-row">
     <span><strong>Knowledge graph reconciliation</strong><small>Node and edge drift detection.</small></span>
     <Network size={16}/>
    </div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Corpus controls</h2></header>
    <div className="production-row"><span><strong>Evidence</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Executive approval</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Autonomous mutation</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

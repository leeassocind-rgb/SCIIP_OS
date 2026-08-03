import React from'react';
import{Activity,Database,Network,Search,ShieldCheck,Sparkles}from'lucide-react';
import{createProductionOperationsModel}from'../production-operations/command-center/index.js';

export default function ProductionOperationsCommandCenter(){
 const model=createProductionOperationsModel({
  runtime:{status:'OPERATIONAL'},
  ingestion:{status:'OPERATIONAL',throughputPerMinute:0,queueDepth:0},
  knowledgeGraph:{status:'SYNCHRONIZED',nodes:0},
  aiServices:{status:'OPERATIONAL',requestsPerMinute:0},
  search:{status:'READY',latencyMs:0},
  eventPipeline:{status:'OPERATIONAL',lagMs:0},
  storage:{status:'HEALTHY',utilizationPct:0},
  approvals:{pending:0}
 });

 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 15 Production Operations</p><h1>Production Operations Command Center</h1><p>Unified operational health across runtime, ingestion, graph, AI, search, events, storage, approvals, and executive KPIs.</p></div>
   <span className="production-activation-badge">READ-ONLY CONTROLS</span>
  </header>
  <section className="production-kpis">
   <article><span>Platform health</span><strong>{model.health}</strong></article>
   <article><span>Services</span><strong>{model.servicesOperational}/{model.servicesTotal}</strong></article>
   <article><span>Queue depth</span><strong>{model.queueDepth}</strong></article>
   <article><span>Pending approvals</span><strong>{model.pendingApprovals}</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Activity size={17}/><h2>Operational services</h2></header>
    {model.services.map(service=><div className="production-row" key={service.name}><span><strong>{service.name}</strong><small>{service.status}</small></span></div>)}
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Operational posture</h2></header>
    <div className="production-row"><span><strong>Ingestion throughput</strong><small>{model.ingestionThroughputPerMinute}/min</small></span><Database size={16}/></div>
    <div className="production-row"><span><strong>Event lag</strong><small>{model.eventLagMs} ms</small></span><Network size={16}/></div>
    <div className="production-row"><span><strong>Search latency</strong><small>{model.searchLatencyMs} ms</small></span><Search size={16}/></div>
    <div className="production-row"><span><strong>AI throughput</strong><small>{model.aiRequestsPerMinute}/min</small></span><Sparkles size={16}/></div>
    <div className="production-row"><span><strong>Production writes</strong><small>Governed</small></span></div>
    <div className="production-row"><span><strong>Autonomous execution</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

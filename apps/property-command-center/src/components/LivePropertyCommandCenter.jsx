import React,{useMemo}from'react';
import{Activity,Building2,Database,MapPin,Search,ShieldCheck}from'lucide-react';
import{useProductionActivationState}from'../production-activation/runtime/index.js';
import{createLivePropertyCommandViewModel}from'../production-activation/live-property/index.js';
import{readGraph}from'../knowledge/graphStore.js';
import{readLedger}from'../ingestion/ingestionLedger.js';

export default function LivePropertyCommandCenter({onNavigate}){
 const activation=useProductionActivationState();
 const graph=useMemo(()=>readGraph(),[activation.revision]);
 const ledger=useMemo(()=>readLedger(),[activation.revision]);
 const view=useMemo(()=>createLivePropertyCommandViewModel({activation,graphSnapshot:graph,ledger}),[activation,graph,ledger]);

 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div>
    <p>Production Data Activation</p>
    <h1>Live Property Command Center</h1>
    <p>Real SuperSheet ingestion, governed property graph, GIS readiness, search, and Copilot evidence.</p>
   </div>
   <span className="production-activation-badge">{view.health}</span>
  </header>
  <section className="production-kpis">
   <article><span>Explorer</span><strong>{view.propertyCount}</strong></article>
   <article><span>Accepted</span><strong>{view.accepted}</strong></article>
   <article><span>Warnings</span><strong>{view.warnings}</strong></article>
   <article><span>Rejected</span><strong>{view.rejected}</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Building2 size={17}/><h2>Live property graph</h2></header>
    {view.properties.length?view.properties.slice(0,12).map((item,index)=>
     <div className="production-row" key={item.id||index}>
      <span><strong>{item.label||item.address||item.id}</strong><small>{item.city||item.attributes?.city||'—'} · governed graph record</small></span>
     </div>
    ):<div className="production-row"><span><strong>No promoted properties yet</strong><small>Upload and promote a governed SuperSheet to populate this workspace.</small></span></div>}
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Live capabilities</h2></header>
    <div className="production-row"><span><strong>Graph</strong><small>{view.graphConnected?'Connected':'Unavailable'}</small></span><Database size={16}/></div>
    <div className="production-row"><span><strong>GIS</strong><small>{view.gisReady?'Ready':'Awaiting coordinates'}</small></span><MapPin size={16}/></div>
    <div className="production-row"><span><strong>Search</strong><small>{view.searchReady?'Ready':'Awaiting records'}</small></span><Search size={16}/></div>
    <div className="production-row"><span><strong>Execution</strong><small>Default denied</small></span><Activity size={16}/></div>
   </aside>
  </div>
  <div className="production-actions">
   <button onClick={()=>onNavigate?.('SuperSheet Ingestion')}>Open ingestion</button>
   <button onClick={()=>onNavigate?.('GIS Intelligence')}>Open GIS</button>
   <button onClick={()=>onNavigate?.('Enterprise Foundation')}>Open search</button>
   <button onClick={()=>onNavigate?.('AI Assistant')}>Open Copilot</button>
  </div>
 </section>;
}

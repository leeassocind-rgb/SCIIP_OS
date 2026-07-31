import React,{useMemo,useState}from'react';
import{Activity,Building2,Clock3,Database,MapPin,Network,ShieldCheck,Zap}from'lucide-react';
import{createPropertyDigitalTwin}from'../property-digital-twin/twinRuntime.js';
import{createPropertyWorkspaceExperience}from'../property-digital-twin/ux/index.js';

const demo={property:{propertyId:'PROP-LOWELL',address:'2125 W Lowell St',city:'Rialto',state:'CA',buildingSf:664859,landAcres:39.8,clearHeightFt:42,powerAmps:8000,latitude:34.1069,longitude:-117.3703,submarket:'Inland Empire West'},states:[{effectiveAt:'2026-07-01',state:{availabilityStatus:'AVAILABLE',askingRate:1.35},evidenceId:'EVID-LOWELL-1',actorId:'SYSTEM'}],relationships:{owner:'BROOKFIELD',assignments:['ASSIGN-LOWELL']},sourceRecords:[{authoritative:true,data:{sourceStatus:'VERIFIED'}}],marketEvents:[{effectiveAt:'2026-07-01',askingRate:1.35,vacancyPct:7.8,marketRank:1,evidenceId:'EVID-MARKET-1'}],infrastructure:[{id:'POWER-1',type:'ELECTRICAL',status:'OPERATIONAL',criticality:'CRITICAL',capacity:'8,000A'}],claims:[{field:'powerAmps',value:8000,evidenceId:'EVID-LOWELL-1',source:'BROCHURE',confidence:.95}]};

export default function PropertyDigitalTwinCenter({assignment}){
 const[timestamp,setTimestamp]=useState(new Date().toISOString());
 const twin=useMemo(()=>createPropertyDigitalTwin({...demo,asOf:timestamp}),[timestamp]);
 const view=useMemo(()=>createPropertyWorkspaceExperience({twin,asOf:timestamp}),[twin,timestamp]);
 return <section className="property-workspace">
  <header className="property-hero"><div><p className="eyebrow">Property Workspace</p><h1>{view.address}</h1><p><MapPin size={14}/>{view.city}, {view.stateCode} · {view.submarket}</p></div><div className="property-health"><Activity size={18}/><span><strong>{view.healthStatus}</strong><small>Health score {view.healthScore}</small></span></div></header>
  <section className="property-metric-grid">{view.metrics.map(metric=><article key={metric.id}><span>{metric.label}</span><strong>{metric.value.toLocaleString()}{metric.suffix}</strong></article>)}</section>
  <nav className="property-section-strip">{view.sections.map(section=><span key={section.id}><strong>{section.label}</strong><small>{section.count}</small></span>)}</nav>
  <div className="property-workspace-grid">
   <main>
    <article className="property-panel"><header><Building2 size={17}/><h2>Current operating state</h2></header><dl>{Object.entries(view.currentState).map(([key,value])=><div key={key}><dt>{key.replaceAll(/([A-Z])/g,' $1')}</dt><dd>{typeof value==='number'?value.toLocaleString():String(value)}</dd></div>)}</dl></article>
    <article className="property-panel"><header><Zap size={17}/><h2>Infrastructure</h2><span>{view.criticalInfrastructureCount} critical</span></header>{view.infrastructure.map(item=><div className="property-row" key={item.id||item.type}><span><strong>{item.type||item.category}</strong><small>{item.capacity||item.description||'Dependency'}</small></span><b>{item.status||item.criticality}</b></div>)}</article>
    <article className="property-panel"><header><Database size={17}/><h2>Evidence lineage</h2><span>{view.evidenceCount} claims</span></header>{view.evidenceClaims.map((claim,index)=><div className="property-row" key={claim.evidenceId||index}><span><strong>{claim.field||'Claim'}</strong><small>{claim.source||'Governed source'} · {Math.round(Number(claim.confidence||0)*100)}% confidence</small></span><b>{String(claim.value??'')}</b></div>)}</article>
   </main>
   <aside>
    <article className="property-panel"><header><Clock3 size={17}/><h2>Temporal reconstruction</h2></header><label>Reconstruct as of<input type="datetime-local" onChange={event=>event.target.value&&setTimestamp(new Date(event.target.value).toISOString())}/></label><p>State history is append-only and reconstructed from preserved events.</p></article>
    <article className="property-panel"><header><Network size={17}/><h2>Relationships</h2><span>{view.relationshipCount}</span></header>{view.relationships.map((item,index)=><div className="property-row" key={item.id||index}><span><strong>{item.type||'Relationship'}</strong><small>{item.to||item.entityId||item.id}</small></span></div>)}</article>
    <article className="property-panel property-governance"><ShieldCheck size={20}/><div><strong>Broker-controlled property intelligence</strong><small>Evidence lineage required. Consequential actions remain blocked.</small></div></article>
   </aside>
  </div>
 </section>
}

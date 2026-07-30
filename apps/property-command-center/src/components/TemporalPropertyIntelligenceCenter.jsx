import React,{useMemo,useState}from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
const fmt=n=>new Intl.NumberFormat('en-US').format(Number(n||0));
const money=n=>n==null?'—':`$${Number(n).toFixed(2)}`;
export default function TemporalPropertyIntelligenceCenter(){
 return <ProductionValidationDataBoundary fileName="temporal-intelligence-data.json">{data=><TemporalPropertyIntelligenceView data={data}/>}</ProductionValidationDataBoundary>;
}
function TemporalPropertyIntelligenceView({data}){
 const[type,setType]=useState('ALL');
 const events=useMemo(()=>data.events.filter(e=>type==='ALL'||e.eventType===type).slice().reverse().slice(0,250),[data,type]);
 const types=Object.keys(data.summary.eventByType||{}).sort();
 return <div className="temporal-center"><div className="temporal-hero"><div><span>GOVERNED MARKET HISTORY</span><h2>Temporal Property Intelligence</h2><p>Daily AIR CRE observations resolved into canonical property timelines and evidence-backed market events.</p></div><div className="cert-pill">{data.status}</div></div>
 <div className="temporal-kpis"><K label="Snapshot dates" value={fmt(data.summary.snapshotDates)}/><K label="Canonical properties" value={fmt(data.summary.canonicalProperties)}/><K label="Market events" value={fmt(data.summary.totalEvents)}/><K label="Latest availability" value={`${fmt(data.summary.latestAvailableSf)} SF`}/></div>
 <section className="temporal-panel"><header><div><h3>Event Ledger</h3><p>{data.summary.firstDate} through {data.summary.latestDate} · removals are observations, not assumed transactions</p></div><select value={type} onChange={e=>setType(e.target.value)}><option value="ALL">All event types</option>{types.map(t=><option key={t}>{t}</option>)}</select></header><div className="event-table"><div className="event-head"><span>Date</span><span>Event</span><span>Property</span><span>Evidence</span></div>{events.map(e=><div className="event-row" key={e.eventId}><span>{e.effectiveDate}</span><span><b>{e.eventType.replaceAll('_',' ')}</b><small>{e.confidence}{e.inferred?' · inferred':''}</small></span><span><b>{e.address}</b><small>{e.city} · {e.region}</small></span><span><b>{e.changes?.length?e.changes.map(c=>`${c.field}: ${c.before??'—'} → ${c.after??'—'}`).join(' · '):'Source observation'}</b><small>{e.evidence?.fileName} · p. {e.evidence?.page??'—'}</small></span></div>)}</div></section>
 <section className="temporal-panel"><header><div><h3>Event Distribution</h3><p>Append-only classification across the certified corpus</p></div></header><div className="event-distribution">{Object.entries(data.summary.eventByType||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=><div key={k}><span>{k.replaceAll('_',' ')}</span><strong>{fmt(v)}</strong></div>)}</div></section></div>;
}
function K({label,value}){return <div><span>{label}</span><strong>{value}</strong></div>}

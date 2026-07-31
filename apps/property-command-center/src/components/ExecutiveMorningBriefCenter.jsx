import React,{useMemo}from'react';
import{AlertTriangle,ArrowRight,CheckCircle2,FileText,LineChart,ShieldCheck}from'lucide-react';
import{runMorningBrief}from'../autonomous-intelligence/morningBriefRuntime.js';
import{createMorningBriefSignalExperience}from'../autonomous-intelligence/ux/index.js';

export default function ExecutiveMorningBriefCenter({signalState={},onNavigate}){
 const result=useMemo(()=>runMorningBrief({
  assignmentId:'enterprise',
  generatedAt:new Date().toISOString(),
  assignments:[{assignmentId:'A-101',name:'Priority Assignment',urgency:82,impact:90,confidence:88,freshness:95,risk:70,reason:'Client decision pending'}],
  marketEvents:[{id:'M-1',type:'RENT_CHANGE',magnitude:.12,confidence:.9,observedAt:new Date().toISOString(),evidenceIds:['E-M1']}],
  comparables:[{id:'C-1',address:'Recent Comparable',date:new Date().toISOString().slice(0,10),evidenceIds:['E-C1']}],
  approvals:[{id:'R-1',status:'PENDING_REVIEW'}],
  evidenceIds:['E-M1','E-C1'],
  evidence:[{evidenceId:'E-M1',source:'MARKET_INTELLIGENCE',fact:'Material market movement detected'},{evidenceId:'E-C1',source:'COMPARABLE_LEDGER',fact:'New comparable recorded'}]
 },{actorId:'executive-brief-service'}),[]);
 const view=useMemo(()=>createMorningBriefSignalExperience({brief:result.brief,decision:result.decision,snapshot:result.snapshot,signalState}),[result,signalState]);
 const go=workspace=>onNavigate?.(workspace);
 return <section className="morning-brief-center">
  <header className="brief-hero"><div><p className="eyebrow">Executive Operating Brief</p><h1>Morning Brief</h1><p>Evidence-backed priorities, market movement, comparable activity, and approvals prepared for broker review.</p></div><div className="brief-governance"><ShieldCheck size={20}/><span><strong>Broker controlled</strong><small>Consequential actions remain blocked</small></span></div></header>
  <div className="brief-grid">
   <article><span>Status</span><strong>{view.status}</strong><small>{view.factsOnly?'Facts only':'Review required'}</small></article>
   <article><span>Priority assignments</span><strong>{view.priorities.length}</strong><small>Ranked for attention</small></article>
   <article><span>Material changes</span><strong>{view.marketChanges.length}</strong><small>Evidence linked</small></article>
   <article><span>Approvals</span><strong>{view.approvals.length}</strong><small>{view.reviewRequired?'Broker review required':'Clear'}</small></article>
   <article><span>Evidence</span><strong>{view.evidenceCount}</strong><small>Traceable sources</small></article>
  </div>
  <article className="brief-detail brief-headline"><div><h2>{view.headline}</h2><p>{new Date(view.generatedAt).toLocaleString('en-US')}</p></div>{view.reviewRequired?<button onClick={()=>go('Action Center')}><span><strong>Review approvals</strong><small>{view.approvals.length} pending</small></span><ArrowRight size={17}/></button>:<span className="brief-clear"><CheckCircle2 size={16}/>No immediate approval exception</span>}</article>
  <div className="brief-experience-grid">
   <article className="brief-section"><header><AlertTriangle size={17}/><h3>Priority assignments</h3></header>{view.priorities.map(item=><button key={item.id} onClick={()=>go('Opportunity Intelligence')}><span><strong>{item.name}</strong><small>{item.reason}</small></span><b>{item.score}</b></button>)}</article>
   <article className="brief-section"><header><LineChart size={17}/><h3>Market changes</h3></header>{view.marketChanges.map(item=><div key={item.id}><span><strong>{item.label}</strong><small>{Math.round(item.confidence*100)}% confidence</small></span><b>{item.magnitude}</b></div>)}</article>
   <article className="brief-section"><header><FileText size={17}/><h3>New comparables</h3></header>{view.comparables.map(item=><button key={item.id} onClick={()=>go('Market Intelligence')}><span><strong>{item.address}</strong><small>{item.date||'Date pending'}</small></span><b>{item.evidenceIds.length}</b></button>)}</article>
  </div>
  <footer className="brief-evidence"><span>Decision {view.decisionId||'pending'}</span>{view.evidenceIds.map(id=><span key={id}>{id}</span>)}</footer>
 </section>
}

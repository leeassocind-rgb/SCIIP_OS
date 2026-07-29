import React,{useMemo}from'react';
import{Activity,ArrowRight,BarChart3,BellRing,Building2,CheckCircle2,Clock3,Database,Map,Network,ShieldCheck,Sparkles,Target,Workflow}from'lucide-react';
import{readGraph}from'../knowledge/graphStore.js';
import{readOpportunityLedger}from'../opportunity/opportunityLedger.js';
import{actionCenterSnapshot}from'../workflow/actionCenterService.js';
import{aggregateExecutiveState,buildExecutiveBriefing,executiveTimeline}from'../executive/executiveEngine.js';
import{governedNotifications}from'../executive/notificationCenter.js';

const iconMap={ingestion:Database,graph:Network,ai:Sparkles,gis:Map,opportunity:Target,workflow:Workflow};
const metric=(label,value,suffix='')=><div className="exec-metric"><span>{label}</span><strong>{value}{suffix}</strong></div>;
export default function ExecutiveCommandCenter({assignment,onNavigate}){
 const graph=useMemo(()=>readGraph(),[assignment?.id]);
 const opportunityLedger=useMemo(()=>readOpportunityLedger(),[assignment?.id]);
 const workflowSnapshot=useMemo(()=>actionCenterSnapshot(assignment?.id),[assignment?.id]);
 const snapshot=useMemo(()=>aggregateExecutiveState({assignment,graph,opportunities:opportunityLedger,workflows:workflowSnapshot.workflows}),[assignment,graph,opportunityLedger,workflowSnapshot]);
 const briefing=useMemo(()=>buildExecutiveBriefing(snapshot),[snapshot]);
 const notices=useMemo(()=>governedNotifications(snapshot),[snapshot]);
 const timeline=useMemo(()=>executiveTimeline({workflows:workflowSnapshot.workflows,opportunities:opportunityLedger}),[workflowSnapshot,opportunityLedger]);
 const go=workspace=>onNavigate?.(workspace);
 return <div className="executive-command-center">
  <section className="exec-hero"><div><span className="kicker">SCIIP EXECUTIVE OPERATING VIEW</span><h2>Executive Command Center</h2><p>One governed view of assignment health, evidence, opportunities, workflows, and broker decisions.</p></div><div className="exec-governance"><ShieldCheck size={20}/><div><strong>Broker controlled</strong><span>Evidence-backed recommendations only</span></div></div></section>
  <section className="exec-kpi-grid">
   {metric('Properties under review',snapshot.kpis.propertiesUnderReview)}
   {metric('High-confidence opportunities',snapshot.kpis.highConfidenceOpportunities)}
   {metric('Approvals required',snapshot.kpis.approvalsRequired)}
   {metric('Workflow completion',snapshot.kpis.workflowCompletion,'%')}
   {metric('Average opportunity score',snapshot.kpis.averageOpportunityScore)}
   {metric('Evidence freshness',snapshot.kpis.evidenceFreshness,'%')}
  </section>
  <div className="exec-grid">
   <section className="exec-panel exec-briefing"><header><div><Sparkles size={18}/><h3>Executive briefing</h3></div><span>Evidence linked</span></header><h4>{briefing.headline}</h4>{briefing.bullets.map(item=><p key={item}><CheckCircle2 size={15}/>{item}</p>)}<footer>{briefing.evidence.map(item=><span key={item}>{item}</span>)}</footer></section>
   <section className="exec-panel"><header><div><BellRing size={18}/><h3>Priority queue</h3></div><span>{notices.length} active</span></header>{notices.length?notices.map(item=><button className={`exec-notice ${item.severity.toLowerCase()}`} key={item.id} onClick={()=>go(item.workspace)}><div><strong>{item.severity}</strong><span>{item.title}</span></div><ArrowRight size={16}/></button>):<div className="exec-empty"><CheckCircle2 size={24}/><strong>No immediate exceptions</strong><span>Governed engines report normal operations.</span></div>}</section>
   <section className="exec-panel exec-health"><header><div><Activity size={18}/><h3>Workspace health</h3></div><span>Unified</span></header>{snapshot.health.map(item=>{const Icon=iconMap[item.id]||Activity;return <button key={item.id} onClick={()=>go(({graph:'Knowledge Graph',gis:'GIS Intelligence',opportunity:'Opportunity Intelligence',workflow:'Action Center',ai:'AI Assistant',ingestion:'SuperSheet Ingestion'})[item.id])}><Icon size={17}/><span>{item.label}</span><strong>{item.status}</strong></button>})}</section>
   <section className="exec-panel"><header><div><Clock3 size={18}/><h3>Executive timeline</h3></div><span>Append only</span></header>{timeline.length?timeline.map(item=><button className="exec-timeline-row" key={item.id} onClick={()=>go(item.workspace)}><span className="exec-timeline-dot"/><div><strong>{item.title}</strong><small>{new Date(item.at).toLocaleString('en-US')}</small></div></button>):<div className="exec-empty"><Clock3 size={24}/><strong>No preserved activity yet</strong><span>Approved opportunities and workflow actions will appear here.</span></div>}</section>
  </div>
  <section className="exec-shortcuts"><button onClick={()=>go('Opportunity Intelligence')}><Target size={18}/><span><strong>Review opportunities</strong><small>Open deterministic assignment matches</small></span><ArrowRight size={17}/></button><button onClick={()=>go('Action Center')}><Workflow size={18}/><span><strong>Manage broker actions</strong><small>Approve and advance governed workflows</small></span><ArrowRight size={17}/></button><button onClick={()=>go('GIS Intelligence')}><Building2 size={18}/><span><strong>Inspect spatial context</strong><small>Review mapped property intelligence</small></span><ArrowRight size={17}/></button></section>
 </div>
}

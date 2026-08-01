import React,{useMemo}from'react';
import{Activity,BookOpenCheck,ShieldAlert,Workflow,Eye}from'lucide-react';
import{createAutonomousExecutiveRuntime}from'../autonomous-executive/runtime/index.js';
import{createExecutivePlaybookApprovalQueue}from'../autonomous-executive/approval-queue/index.js';
import{createExecutiveAlertOperations}from'../autonomous-executive/alert-operations/index.js';
import{createExecutiveObservabilityTimeline}from'../autonomous-executive/timeline/index.js';

const runtime=createAutonomousExecutiveRuntime();

export default function AutonomousExecutiveOperationsCenter(){
 const state=runtime.getSnapshot();
 const approvals=useMemo(()=>createExecutivePlaybookApprovalQueue({items:state.playbooks}).snapshot(),[state.revision]);
 const alerts=useMemo(()=>createExecutiveAlertOperations({alerts:state.alerts}),[state.revision]);
 const timeline=useMemo(()=>createExecutiveObservabilityTimeline(state),[state.revision]);

 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 9 Operations</p><h1>Autonomous Executive Operations Center</h1><p>Continuous detection, autonomous planning, approval queues, alerts, and full observability.</p></div>
   <span className="production-activation-badge">EXECUTION DISABLED</span>
  </header>
  <section className="production-kpis">
   <article><span>Events</span><strong>{state.events.length}</strong></article>
   <article><span>Plans</span><strong>{state.runs.length}</strong></article>
   <article><span>Pending approvals</span><strong>{approvals.pending}</strong></article>
   <article><span>Open alerts</span><strong>{alerts.open}</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><Eye size={17}/><h2>Observability timeline</h2></header>
    {timeline.items.length?timeline.items.slice(0,20).map(item=><div className="production-row" key={`${item.kind}-${item.id}`}><span><strong>{item.kind} · {item.label}</strong><small>{item.subjectId||'—'} · {item.timestamp}</small></span></div>):<div className="production-row"><span><strong>No operating events yet</strong><small>The timeline will populate as governed events arrive.</small></span></div>}
   </main>
   <aside className="production-panel">
    <header><ShieldAlert size={17}/><h2>Control posture</h2></header>
    <div className="production-row"><span><strong>Continuous detection</strong><small>Enabled</small></span><Activity size={16}/></div>
    <div className="production-row"><span><strong>Autonomous planning</strong><small>Enabled</small></span><Workflow size={16}/></div>
    <div className="production-row"><span><strong>Human approvals</strong><small>Required</small></span><BookOpenCheck size={16}/></div>
    <div className="production-row"><span><strong>Production execution</strong><small>Disabled</small></span><ShieldAlert size={16}/></div>
   </aside>
  </div>
 </section>;
}

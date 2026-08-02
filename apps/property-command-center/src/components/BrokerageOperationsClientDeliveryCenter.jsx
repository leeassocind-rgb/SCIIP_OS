import React from'react';
import{ClipboardCheck,MessageSquareText,Clock3,ShieldCheck}from'lucide-react';

export default function BrokerageOperationsClientDeliveryCenter(){
 return <section className="production-activation-center">
  <header className="production-activation-hero">
   <div><p>Phase 17 Brokerage Operations</p><h1>Brokerage Operations & Client Delivery Center</h1><p>Client communications, deal execution, transaction milestones, assignment delivery, and executive operations review.</p></div>
   <span className="production-activation-badge">BROKER CONTROLLED DELIVERY</span>
  </header>
  <section className="production-kpis">
   <article><span>Client communications</span><strong>REVIEWED</strong></article>
   <article><span>Deal execution</span><strong>GOVERNED</strong></article>
   <article><span>Milestones</span><strong>MONITORED</strong></article>
   <article><span>Auto publishing</span><strong>OFF</strong></article>
  </section>
  <div className="production-grid">
   <main className="production-panel">
    <header><ClipboardCheck size={17}/><h2>Operations review</h2></header>
    <div className="production-row"><span><strong>Client delivery</strong><small>Evidence-preserving and broker-editable.</small></span><MessageSquareText size={16}/></div>
    <div className="production-row"><span><strong>Transaction milestones</strong><small>Deadline, risk, and overdue visibility.</small></span><Clock3 size={16}/></div>
   </main>
   <aside className="production-panel">
    <header><ShieldCheck size={17}/><h2>Delivery controls</h2></header>
    <div className="production-row"><span><strong>Broker review</strong><small>Required</small></span></div>
    <div className="production-row"><span><strong>Client communication</strong><small>Broker approved</small></span></div>
    <div className="production-row"><span><strong>Automatic publishing</strong><small>Disabled</small></span></div>
   </aside>
  </div>
 </section>;
}

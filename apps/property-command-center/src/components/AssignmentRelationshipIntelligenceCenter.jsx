import React from 'react';
import { Activity, Network, Building2, ShieldCheck } from 'lucide-react';

export default function AssignmentRelationshipIntelligenceCenter() {
  return <section className="production-activation-center">
    <header className="production-activation-hero">
      <div>
        <p>Phase 17 Assignment Intelligence</p>
        <h1>Assignment & Relationship Intelligence Center</h1>
        <p>Assignment signals, relationship opportunities, requirement matching, property strategy, and executive assignment intelligence.</p>
      </div>
      <span className="production-activation-badge">BROKER REVIEW REQUIRED</span>
    </header>

    <section className="production-kpis">
      <article><span>Assignment signals</span><strong>ACTIVE</strong></article>
      <article><span>Relationship graph</span><strong>CONNECTED</strong></article>
      <article><span>Property matching</span><strong>EXPLAINABLE</strong></article>
      <article><span>Autonomous outreach</span><strong>OFF</strong></article>
    </section>

    <div className="production-grid">
      <main className="production-panel">
        <header><Activity size={17}/><h2>Assignment intelligence</h2></header>
        <div className="production-row">
          <span><strong>Relationship opportunities</strong><small>Graph-native and evidence-backed.</small></span>
          <Network size={16}/>
        </div>
        <div className="production-row">
          <span><strong>Property strategy</strong><small>Risk-adjusted and assignment-specific.</small></span>
          <Building2 size={16}/>
        </div>
      </main>

      <aside className="production-panel">
        <header><ShieldCheck size={17}/><h2>Broker controls</h2></header>
        <div className="production-row"><span><strong>Evidence</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Broker review</strong><small>Required</small></span></div>
        <div className="production-row"><span><strong>Autonomous outreach</strong><small>Disabled</small></span></div>
      </aside>
    </div>
  </section>;
}

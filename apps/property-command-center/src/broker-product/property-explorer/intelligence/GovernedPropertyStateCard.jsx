import React,{useEffect,useMemo,useState}from'react';
import{buildGovernedPropertyState}from'./GovernedPropertyState.js';

function propertyIdOf(property){
  return property?.id||property?.propertyId||property?.canonicalPropertyId||null;
}

function Metric({label,value,suffix=''}){return <div><span>{label}</span><strong>{value}{suffix}</strong></div>;}

export default function GovernedPropertyStateCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildGovernedPropertyState(property,model));

  useEffect(()=>{
    const refresh=(event)=>{
      const eventPropertyId=event?.detail?.propertyId??null;
      if(eventPropertyId&&propertyId&&eventPropertyId!==propertyId)return;
      setState(buildGovernedPropertyState(property,model));
    };
    refresh();
    const events=[
      'sciip:governed-decision-persisted',
      'sciip:governed-approval-updated',
      'sciip:canonical-promotion-executed',
      'sciip:canonical-promotion-rolled-back',
      'sciip:property-intelligence-refresh'
    ];
    for(const name of events)window.addEventListener(name,refresh);
    window.addEventListener('storage',refresh);
    return()=>{
      for(const name of events)window.removeEventListener(name,refresh);
      window.removeEventListener('storage',refresh);
    };
  },[propertyId,property,model]);

  if(!state||state.status!=='ACTIVE')return null;
  const m=state.metrics;

  return <details className="governed-property-state" open>
    <summary>
      <div><span>PROPERTY GOVERNANCE</span><strong>Governed Property State</strong></div>
      <em>{state.state.replaceAll('_',' ')}</em>
    </summary>

    <div className="governed-property-state__hero">
      <div>
        <span>LEGACY GOVERNANCE COMPOSITE</span>
        <strong>{state.confidence}</strong>
        <small>{state.confidenceScore}/100</small>
      </div>
      <div className="governed-property-state__hero-copy">
        <strong>{state.state.replaceAll('_',' ')}</strong>
        <span>Canonical authority: SCIIP</span>
      </div>
    </div>

    <div className="governed-property-state__metrics">
      <Metric label="Canonical completeness" value={m.completenessPct} suffix="%"/>
      <Metric label="Corroboration" value={m.corroborationPct} suffix="%"/>
      <Metric label="External coverage" value={m.externalCoveragePct} suffix="%"/>
      <Metric label="Pending governance" value={m.pendingGovernance}/>
      <Metric label="Enrichment available" value={m.enrichmentOnly}/>
      <Metric label="Review required" value={m.review}/>
    </div>

    <div className="governed-property-state__signals">
      <span>{m.activeOverlays} active canonical overlay{m.activeOverlays===1?'':'s'}</span>
      <span>{m.rolledBack} rolled-back lifecycle{m.rolledBack===1?'':'s'}</span>
      <span>{m.unresolvedGovernance} unresolved governance item{m.unresolvedGovernance===1?'':'s'}</span>
    </div>

    <div className="governed-property-state__footer">
      <span>Authority: SCIIP</span>
      <span>State: event-derived</span>
      <span>Legacy composite: governance synthesis</span>
    </div>
  </details>;
}

import React,{useEffect,useMemo,useState}from'react';
import{buildIntelligenceGapEngine}from'./IntelligenceGapEngine.js';
import GovernedIntelligenceAcquisitionInline from'./GovernedIntelligenceAcquisitionInline.jsx';
import GovernedEvidenceWorkflowInline from'./GovernedEvidenceWorkflowInline.jsx';

function propertyIdOf(property){
  return property?.id||property?.propertyId||property?.canonicalPropertyId||null;
}

export default function IntelligenceGapCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildIntelligenceGapEngine(property,model));

  useEffect(()=>{
    const refresh=(event)=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&id!==propertyId)return;
      setState(buildIntelligenceGapEngine(property,model));
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

  return <details className="intelligence-gaps" open>
    <summary>
      <div><span>INTELLIGENCE ACQUISITION</span><strong>Intelligence Gaps & Next Actions</strong></div>
      <em>{state.counts.total} gap{state.counts.total===1?'':'s'}</em>
    </summary>

    <div className="intelligence-gaps__hero">
      <div>
        <span>TOP PRIORITY</span>
        <strong>{state.topPriorityGap?.label||'No material gap'}</strong>
        <em>{state.topPriorityGap?.severity||'CLEAR'}</em>
      </div>
      <p>{state.nextBestAction}</p>
    </div>

    <div className="intelligence-gaps__summary">
      <span>{state.counts.critical} critical</span>
      <span>{state.counts.high} high</span>
      <span>{state.counts.missing} missing</span>
      <span>{state.counts.conflicts} conflicts</span>
      <span>{state.counts.governanceRequired} governance</span>
    </div>

    {state.gaps.length===0?
      <div className="intelligence-gaps__empty">No material intelligence gaps detected.</div>:
      <div className="intelligence-gaps__rows">
        {state.gaps.slice(0,8).map(gap=><div className="intelligence-gaps__row" key={`${gap.fieldKey}:${gap.type}`}>
          <div><strong>{gap.label}</strong><span>{gap.type.replaceAll('_',' ')}</span></div>
          <div><span>Priority</span><strong>{gap.priorityScore}</strong></div>
          <div><span>Source</span><strong>{gap.recommendedSource}</strong></div>
          <div><em>{gap.severity}</em></div>
          <small>{gap.recommendedAction}</small>
        </div>)}
      </div>}

    <div className="intelligence-gaps__footer">
      <span>Mode: recommendation only</span>
      <span>Automatic external writes: OFF</span>
    </div>

    <GovernedIntelligenceAcquisitionInline property={property} gaps={state.gaps} />
    <GovernedEvidenceWorkflowInline property={property} gaps={state.gaps} />
  </details>;
}

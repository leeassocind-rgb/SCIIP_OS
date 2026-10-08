import React,{useEffect,useMemo,useState}from'react';
import{buildDecisionLifecycleRegistry}from'./DecisionLifecycle.js';

function propertyIdOf(property){
  return property?.id||property?.propertyId||property?.canonicalPropertyId||null;
}

export default function DecisionLifecycleCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const fieldKeys=(model?.propertyProvenance?.fields||[]).map(x=>x.key);
  const[state,setState]=useState(()=>buildDecisionLifecycleRegistry(propertyId,fieldKeys));

  useEffect(()=>{
    const refresh=(event)=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&id!==propertyId)return;
      setState(buildDecisionLifecycleRegistry(propertyId,fieldKeys));
    };
    refresh();
    const names=[
      'sciip:governed-decision-persisted',
      'sciip:governed-approval-updated',
      'sciip:canonical-promotion-executed',
      'sciip:canonical-promotion-rolled-back',
      'sciip:property-intelligence-refresh'
    ];
    for(const name of names)window.addEventListener(name,refresh);
    window.addEventListener('storage',refresh);
    return()=>{
      for(const name of names)window.removeEventListener(name,refresh);
      window.removeEventListener('storage',refresh);
    };
  },[propertyId]);

  const meaningful=state.fields.filter(x=>x.state!=='UNRESOLVED');
  if(meaningful.length===0)return null;

  return <details className="decision-lifecycle" open>
    <summary>
      <div><span>GOVERNED LIFECYCLE</span><strong>Canonical State Reconciliation</strong></div>
      <em>{meaningful.length} tracked</em>
    </summary>
    <div className="decision-lifecycle__notice">
      Lifecycle state is reconstructed from immutable decision, approval, execution, and rollback events. Browser refresh does not reset governance state.
    </div>
    <div className="decision-lifecycle__rows">
      {meaningful.map(item=><div className="decision-lifecycle__row" key={item.fieldKey}>
        <strong>{item.fieldKey}</strong>
        <span>{item.state.replaceAll('_',' ')}</span>
        <small>{item.state==='ROLLED_BACK'?'Candidate eligible again':item.closed?'Lifecycle closed':'Action pending'}</small>
      </div>)}
    </div>
    <div className="decision-lifecycle__footer">
      <span>Reconstruction: event-derived</span>
      <span>Refresh durable</span>
    </div>
  </details>;
}

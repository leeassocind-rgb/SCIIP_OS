import React,{useEffect,useMemo,useState}from'react';
import{resolveGovernedPropertyTruthContract}from'./GovernedPropertyTruthContract.js';
import'./GovernedPropertyTruthContractCard.css';

const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const label=s=>String(s||'').replaceAll('_',' ');

export default function GovernedPropertyTruthContractCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>resolveGovernedPropertyTruthContract(property,model));

  useEffect(()=>{
    const refresh=event=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&String(id)!==String(propertyId))return;
      setState(resolveGovernedPropertyTruthContract(property,model));
    };
    refresh();
    const names=[
      'sciip:canonical-promotion-executed',
      'sciip:canonical-promotion-rolled-back',
      'sciip:governed-promotion-decision',
      'sciip:property-intelligence-refresh'
    ];
    for(const name of names)window.addEventListener(name,refresh);
    window.addEventListener('storage',refresh);
    return()=>{
      for(const name of names)window.removeEventListener(name,refresh);
      window.removeEventListener('storage',refresh);
    };
  },[propertyId,property,model]);

  if(!state||state.status!=='ACTIVE')return null;

  return <details className="governed-truth-contract" open data-milestone="M2.29">
    <summary>
      <div><span>SHARED TRUTH CONTRACT</span><strong>Governed Property Truth</strong></div>
      <em>{label(state.canonicalState)}</em>
    </summary>

    <div className="governed-truth-contract__hero">
      <div>
        <span>CONTRACT</span>
        <strong>v{state.contractVersion}</strong>
        <small>{state.projectionId}</small>
      </div>
      <p>One governed property truth interface for downstream Explorer consumers.</p>
    </div>

    <div className="governed-truth-contract__metrics">
      <div><strong>{Object.keys(state.fields||{}).length}</strong><span>Fields</span></div>
      <div><strong>{state.consumers.length}</strong><span>Consumers</span></div>
      <div><strong>{state.invariants.readOnly?'ON':'OFF'}</strong><span>Read-only</span></div>
    </div>

    <div className="governed-truth-contract__consumers">
      {state.consumers.map(x=><span key={x}>{x}</span>)}
    </div>

    <div className="governed-truth-contract__footer">
      <span>Projection authoritative</span>
      <span>Rollback aware</span>
      <span>Writes: OFF</span>
    </div>
  </details>;
}

import React,{useEffect,useMemo,useState}from'react';
import{resolveCanonicalPropertyProjection}from'./CanonicalPropertyProjection.js';
import{
  buildGovernedPropertyRuntimeBoundary,
  publishGovernedPropertyRuntime,
  clearGovernedPropertyRuntime
}from'./GovernedPropertyRuntimeBoundary.js';
import'./GovernedPropertyRuntimeBoundaryCard.css';

const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const label=s=>String(s||'').replaceAll('_',' ');

function resolve(property,model){
  const projection=resolveCanonicalPropertyProjection(property,model);
  return buildGovernedPropertyRuntimeBoundary(projection);
}

export default function GovernedPropertyRuntimeBoundaryCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>resolve(property,model));

  useEffect(()=>{
    if(state?.status==='ACTIVE')publishGovernedPropertyRuntime(state);
    return()=>{
      if(state?.propertyKey)clearGovernedPropertyRuntime(state.propertyKey);
    };
  },[state]);

  useEffect(()=>{
    const refresh=event=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&String(id)!==String(propertyId))return;
      setState(resolve(property,model));
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

  return <details className="governed-runtime-boundary" open data-milestone="M2.30">
    <summary>
      <div><span>EXPLORER RUNTIME</span><strong>Governed Property Runtime</strong></div>
      <em>{label(state.canonicalState)}</em>
    </summary>

    <div className="governed-runtime-boundary__hero">
      <div>
        <span>RUNTIME CONTRACT</span>
        <strong>v{state.runtimeVersion}</strong>
        <small>{state.projectionId}</small>
      </div>
      <p>Shared property truth published as the standard read-only runtime boundary for Explorer.</p>
    </div>

    <div className="governed-runtime-boundary__metrics">
      <div><strong>{Object.keys(state.fields||{}).length}</strong><span>Fields</span></div>
      <div><strong>{state.propertyKey?'LIVE':'OFF'}</strong><span>Boundary</span></div>
      <div><strong>{state.invariants.rollbackAware?'ON':'OFF'}</strong><span>Rollback aware</span></div>
    </div>

    <div className="governed-runtime-boundary__status">
      <span>Property-scoped</span>
      <span>Projection-backed</span>
      <span>Shared truth</span>
    </div>

    <div className="governed-runtime-boundary__footer">
      <span>Read-only</span>
      <span>Registry published</span>
      <span>Writes: OFF</span>
    </div>
  </details>;
}

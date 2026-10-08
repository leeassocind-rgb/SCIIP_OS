import React,{useEffect,useMemo,useState}from'react';
import{resolveCanonicalPropertyProjection}from'./CanonicalPropertyProjection.js';
import'./CanonicalPropertyProjectionCard.css';

const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const label=s=>String(s||'').replaceAll('_',' ');

export default function CanonicalPropertyProjectionCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>resolveCanonicalPropertyProjection(property,model));

  useEffect(()=>{
    const refresh=event=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&String(id)!==String(propertyId))return;
      setState(resolveCanonicalPropertyProjection(property,model));
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

  const governedFields=Object.values(state.fields).filter(x=>x.overlayActive);

  return <details className="canonical-property-projection" open data-milestone="M2.28">
    <summary>
      <div><span>CANONICAL PROJECTION</span><strong>Canonical Property Projection</strong></div>
      <em>{label(state.canonicalState)}</em>
    </summary>

    <div className="canonical-property-projection__hero">
      <div>
        <span>PROJECTION ID</span>
        <strong>{state.projectionId}</strong>
      </div>
      <p>Stable property truth resolved from base canonical data plus active governed overlays.</p>
    </div>

    <div className="canonical-property-projection__metrics">
      <div><strong>{Object.keys(state.fields).length}</strong><span>Projected fields</span></div>
      <div><strong>{state.overlayCount}</strong><span>Governed overlays</span></div>
      <div><strong>{governedFields.length}</strong><span>Governed fields</span></div>
    </div>

    {governedFields.length>0?
      <div className="canonical-property-projection__rows">
        {governedFields.map(x=><div className="canonical-property-projection__row" key={x.fieldKey}>
          <strong>{x.fieldKey}</strong>
          <span>{String(x.value??'—')}</span>
          <em>GOVERNED</em>
        </div>)}
      </div>
      :
      <div className="canonical-property-projection__clear">
        Projection currently resolves entirely to base canonical values.
      </div>
    }

    <div className="canonical-property-projection__footer">
      <span>Deterministic</span>
      <span>Rollback aware</span>
      <span>Base mutation: OFF</span>
    </div>
  </details>;
}

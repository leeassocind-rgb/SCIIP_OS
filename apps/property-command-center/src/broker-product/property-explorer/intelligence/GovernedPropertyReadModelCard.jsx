import React,{useEffect,useMemo,useState}from'react';
import{buildGovernedPropertyReadModel}from'./GovernedPropertyReadModel.js';
import'./GovernedPropertyReadModelCard.css';

const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const label=s=>String(s||'').replaceAll('_',' ');

export default function GovernedPropertyReadModelCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildGovernedPropertyReadModel(property,model));

  useEffect(()=>{
    const refresh=event=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&String(id)!==String(propertyId))return;
      setState(buildGovernedPropertyReadModel(property,model));
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

  const overlayFields=Object.values(state.fieldState).filter(x=>x.overlayActive);

  return <details className="governed-read-model" open data-milestone="M2.27">
    <summary>
      <div><span>CANONICAL READ MODEL</span><strong>Governed Property Read State</strong></div>
      <em>{label(state.canonicalState)}</em>
    </summary>

    <div className="governed-read-model__hero">
      <div>
        <span>EFFECTIVE PROPERTY</span>
        <strong>{overlayFields.length?`${overlayFields.length} governed overlay${overlayFields.length===1?'':'s'}`:'Base canonical'}</strong>
      </div>
      <p>Explorer consumers read the effective governed state without mutating the base property record.</p>
    </div>

    {overlayFields.length>0?
      <div className="governed-read-model__rows">
        {overlayFields.map(x=><div className="governed-read-model__row" key={x.fieldKey}>
          <strong>{x.fieldKey}</strong>
          <span>{String(x.baseValue??'—')} → {String(x.effectiveValue??'—')}</span>
          <em>GOVERNED</em>
        </div>)}
      </div>
      :
      <div className="governed-read-model__clear">No active overlay. Consumers resolve directly to base canonical values.</div>
    }

    <div className="governed-read-model__footer">
      <span>Read-only</span>
      <span>Rollback aware</span>
      <span>Base mutation: OFF</span>
    </div>
  </details>;
}

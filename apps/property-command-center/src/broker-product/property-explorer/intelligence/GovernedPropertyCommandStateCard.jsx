import React,{useEffect,useMemo,useState}from'react';
import{buildGovernedPropertyCommandState}from'./GovernedPropertyCommandState.js';
import'./GovernedPropertyCommandStateCard.css';

const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const label=s=>String(s||'').replaceAll('_',' ');
const fmt=v=>v===null||v===undefined||v===''?'—':String(v);

export default function GovernedPropertyCommandStateCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildGovernedPropertyCommandState(property,model));

  useEffect(()=>{
    const refresh=event=>{
      const id=event?.detail?.propertyId??null;
      if(id&&propertyId&&String(id)!==String(propertyId))return;
      setState(buildGovernedPropertyCommandState(property,model));
    };
    refresh();
    const names=[
      'sciip:governed-evidence-updated',
      'sciip:governed-promotion-decision',
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
  },[propertyId,property,model]);

  if(!state||state.status!=='ACTIVE')return null;
  const s=state.lifecycleSummary;

  return <details className="governed-property-command" open data-milestone="M2.26">
    <summary>
      <div><span>PROPERTY COMMAND</span><strong>Governed Property State</strong></div>
      <em>{label(state.canonicalState)}</em>
    </summary>

    <div className="governed-property-command__hero">
      <div><span>CURRENT GOVERNED STATE</span><strong>{label(state.canonicalState)}</strong></div>
      <p>One property-level reconstruction of evidence, promotion, execution, rollback, and current canonical overlays.</p>
    </div>

    <div className="governed-property-command__metrics">
      <div><strong>{s.activeOverlays}</strong><span>Active overlays</span></div>
      <div><strong>{s.pendingActions}</strong><span>Pending actions</span></div>
      <div><strong>{s.executions}</strong><span>Executions</span></div>
      <div><strong>{s.rollbacks}</strong><span>Rollbacks</span></div>
    </div>

    {state.activeCanonicalOverlays.length>0&&<div className="governed-property-command__section">
      <div className="governed-property-command__section-head"><strong>Canonical changes now active</strong><span>{state.activeCanonicalOverlays.length}</span></div>
      {state.activeCanonicalOverlays.map(x=><div className="governed-property-command__row" key={x.overlayId||x.fieldKey}>
        <strong>{x.fieldKey}</strong><span>{fmt(x.priorCanonicalValue)} → {fmt(x.value)}</span><em>ACTIVE</em>
      </div>)}
    </div>}

    {state.pendingActions.length>0&&<div className="governed-property-command__section">
      <div className="governed-property-command__section-head"><strong>Action queue</strong><span>{state.pendingActions.length}</span></div>
      {state.pendingActions.slice(0,6).map((x,i)=><div className="governed-property-command__row" key={`${x.type}:${x.fieldKey}:${i}`}>
        <strong>{x.fieldKey}</strong><span>{x.label}</span><em>{label(x.type)}</em>
      </div>)}
    </div>}

    {state.activeCanonicalOverlays.length===0&&state.pendingActions.length===0&&
      <div className="governed-property-command__clear">No governed canonical action is currently pending.</div>}

    <div className="governed-property-command__footer">
      <span>Event reconstructed</span>
      <span>Append-only history</span>
      <span>Automatic canonical writes: OFF</span>
    </div>
  </details>;
}

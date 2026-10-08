import React,{useEffect,useMemo,useState}from'react';
import{
  createAttributeResolutionDecision,
  applyResolutionDecision,
  dispatchResolutionDecision
}from'./GovernedAttributeResolution.js';
import{appendDecisionEvent,getDecisionWorkflowState,listPromotionQueue}from'./GovernedDecisionStore.js';
import{buildFieldDecisionLifecycle}from'./DecisionLifecycle.js';

function formatValue(value){
  if(value===null||value===undefined||value==='')return'—';
  if(typeof value==='number')return Number.isInteger(value)?value.toLocaleString('en-US'):value.toFixed(2);
  return String(value);
}

function identity(model){
  return {
    propertyId:model?.property?.id||model?.propertyId||model?.id||model?.canonicalPropertyId||null,
    propertyAddress:model?.property?.address||model?.address||model?.canonicalAddress||null
  };
}

function synthesizeRolledBackCandidate(propertyId,fieldKey){
  const life=buildFieldDecisionLifecycle(propertyId,fieldKey);
  if(life.state!=='ROLLED_BACK')return null;
  const promotion=listPromotionQueue({propertyId}).filter(x=>x.fieldKey===fieldKey).slice(-1)[0];
  if(!promotion)return null;
  return {
    id:`resolution:${fieldKey}:rollback`,
    fieldKey,
    label:fieldKey==='propertyType'?'Property Type':fieldKey,
    group:'Reconciled',
    agreementState:'ENRICHMENT_ONLY',
    conflictState:'NONE',
    confidence:promotion.confidence||'MEDIUM',
    canonicalValue:life.canonicalBefore??null,
    externalValue:promotion.proposedValue??null,
    normalizedExternalValue:promotion.normalizedProposedValue??null,
    canonicalAuthority:'SCIIP',
    evidenceSources:promotion.sourceProviders||[],
    provenance:{mergePolicy:'ENRICH_NEVER_OVERWRITE'},
    decisionStatus:'UNRESOLVED',
    eligibleForProposal:true,
    automaticWriteAllowed:false
  };
}

export default function GovernedAttributeResolutionCard({model}){
  const incoming=model?.attributeResolution??null;
  const id=useMemo(()=>identity(model),[model]);
  const[resolution,setResolution]=useState(incoming);
  const[lastDecision,setLastDecision]=useState(null);
  const[lastPersistedEvent,setLastPersistedEvent]=useState(null);
  const[refreshTick,setRefreshTick]=useState(0);

  useEffect(()=>{
    setResolution(incoming);
    setLastDecision(null);
    setLastPersistedEvent(null);
  },[incoming]);

  useEffect(()=>{
    const h=()=>setRefreshTick(x=>x+1);
    window.addEventListener('sciip:property-intelligence-refresh',h);
    window.addEventListener('sciip:canonical-promotion-executed',h);
    window.addEventListener('sciip:canonical-promotion-rolled-back',h);
    window.addEventListener('storage',h);
    return()=>{
      window.removeEventListener('sciip:property-intelligence-refresh',h);
      window.removeEventListener('sciip:canonical-promotion-executed',h);
      window.removeEventListener('sciip:canonical-promotion-rolled-back',h);
      window.removeEventListener('storage',h);
    };
  },[]);

  if(!resolution){
    if(import.meta.env.DEV)return <section className="attribute-resolution attribute-resolution--diagnostic">
      <div><span>GOVERNED DECISION LAYER</span><strong>Attribute Resolution</strong></div>
      <p>Runtime wiring unavailable: model.attributeResolution was not supplied.</p>
    </section>;
    return null;
  }

  const baseItems=resolution.items||[];
  const knownKeys=new Set(baseItems.map(x=>x.fieldKey));
  const historyKeys=['propertyType','landUse','assessedTotal'];
  const resurrected=historyKeys
    .filter(key=>!knownKeys.has(key))
    .map(key=>synthesizeRolledBackCandidate(id.propertyId,key))
    .filter(Boolean);

  const visibleItems=[...baseItems,...resurrected].filter(item=>{
    const life=buildFieldDecisionLifecycle(id.propertyId,item.fieldKey);
    if(life.state==='EXECUTED')return false;
    if(life.state==='ROLLED_BACK')return true;
    if(['REJECTED','DEFERRED'].includes(life.state))return false;
    return true;
  }).map(item=>{
    const life=buildFieldDecisionLifecycle(id.propertyId,item.fieldKey);
    return life.state==='ROLLED_BACK'?{...item,decisionStatus:'UNRESOLVED'}:item;
  });

  const act=(item,action)=>{
    const decision=createAttributeResolutionDecision(item,action);
    const event=appendDecisionEvent(decision,{
      propertyId:id.propertyId,
      propertyAddress:id.propertyAddress
    });
    setResolution(current=>applyResolutionDecision(current,decision));
    setLastDecision(decision);
    setLastPersistedEvent(event);
    dispatchResolutionDecision(decision);
    if(typeof window!=='undefined'){
      const workflow=getDecisionWorkflowState({propertyId:id.propertyId});
      window.dispatchEvent(new CustomEvent('sciip:governed-decision-persisted',{
        detail:{decision,event,propertyId:id.propertyId,workflow}
      }));
    }
  };

  return <details className="attribute-resolution" open>
    <summary>
      <div><span>GOVERNED DECISION LAYER</span><strong>Attribute Resolution</strong></div>
      <em>{visibleItems.length} candidate{visibleItems.length===1?'':'s'}</em>
    </summary>

    <div className="attribute-resolution__notice">
      Candidate visibility is lifecycle-aware. Executed fields retire; rolled-back fields become eligible for governed resolution again.
    </div>

    <div className="attribute-resolution__rows">
      {visibleItems.map(item=><div className="attribute-resolution__row" key={item.fieldKey}>
        <div className="attribute-resolution__field"><strong>{item.label}</strong><span>{item.group} · {item.agreementState}</span></div>
        <div><span>SCIIP</span><strong>{formatValue(item.canonicalValue)}</strong></div>
        <div><span>External</span><strong>{formatValue(item.externalValue)}</strong></div>
        <div className="attribute-resolution__actions">
          {item.decisionStatus==='UNRESOLVED'?<>
            <button type="button" onClick={()=>act(item,'ACCEPT')} disabled={!item.eligibleForProposal}>Accept</button>
            <button type="button" onClick={()=>act(item,'REJECT')}>Reject</button>
            <button type="button" onClick={()=>act(item,'DEFER')}>Defer</button>
          </>:<span className="attribute-resolution__decision">{item.decisionStatus.replaceAll('_',' ')}</span>}
        </div>
      </div>)}
    </div>

    {lastDecision&&<div className="attribute-resolution__audit">
      <strong>Decision recorded</strong>
      <span>{lastDecision.label} · {lastDecision.status.replaceAll('_',' ')}</span>
      <small>{lastPersistedEvent?`Persisted event ${lastPersistedEvent.eventId}`:'Persistence unavailable'}</small>
      <small>No canonical mutation performed.</small>
    </div>}

    <div className="attribute-resolution__footer">
      <span>Authority: SCIIP</span>
      <span>Lifecycle: event-derived</span>
      <span>Refresh durable</span>
    </div>
  </details>;
}

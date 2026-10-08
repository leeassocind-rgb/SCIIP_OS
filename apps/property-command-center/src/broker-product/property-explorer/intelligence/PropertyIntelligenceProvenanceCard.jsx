import React,{useEffect,useMemo,useState}from'react';
import{formatProvenanceValue}from'./PropertyIntelligenceProvenance.js';
import{reconcilePropertyPresentation}from'./CanonicalStateReconciler.js';

const PRIMARY_FIELDS=['parcelId','landAcres','propertyType','assessedTotal','buildingSf'];

function propertyIdOf(model){
  return model?.property?.id||model?.propertyId||model?.id||model?.canonicalPropertyId||null;
}

function StateBadge({state}){
  return <em className={`field-provenance__state field-provenance__state--${String(state).toLowerCase()}`}>{state}</em>;
}

export default function PropertyIntelligenceProvenanceCard({model}){
  const propertyId=propertyIdOf(model);
  const provenance=model?.propertyProvenance;
  const[refreshTick,setRefreshTick]=useState(0);

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

  const reconciled=useMemo(
    ()=>reconcilePropertyPresentation(propertyId,provenance),
    [propertyId,provenance,refreshTick]
  );

  if(!provenance||provenance.status!=='ACTIVE')return null;

  const rows=PRIMARY_FIELDS
    .map(key=>reconciled.fields.find(field=>field.key===key))
    .filter(Boolean);

  return <details className="field-provenance" open>
    <summary>
      <div><span>FIELD-LEVEL GOVERNANCE</span><strong>Normalization & Provenance</strong></div>
      <em>{reconciled.counts.review?'REVIEW':reconciled.counts.agreed?'CORROBORATED':'CANONICAL'}</em>
    </summary>

    <div className="field-provenance__summary">
      <span>{reconciled.counts.agreed} aligned</span>
      <span>{reconciled.counts.enrichmentOnly} enrichment</span>
      <span>{reconciled.counts.review} review</span>
      <span>{reconciled.counts.canonicalOnly} canonical-only</span>
    </div>

    <div className="field-provenance__rows">
      {rows.map(field=><div className="field-provenance__row" key={field.key}>
        <div className="field-provenance__name"><strong>{field.label}</strong><span>{field.group}</span></div>
        <div><span>SCIIP</span><strong>{formatProvenanceValue(field,field.effectiveCanonicalValue)}</strong></div>
        <div><span>LightBox</span><strong>{formatProvenanceValue(field,field.externalValue)}</strong></div>
        <div className="field-provenance__result">
          <StateBadge state={field.effectiveAgreementState}/>
          <small>{field.restoredByRollback?'ROLLBACK RESTORED':field.confidence}</small>
        </div>
      </div>)}
    </div>

    <div className="field-provenance__footer">
      <span>Authority: SCIIP</span>
      <span>State: event reconciled</span>
    </div>
  </details>;
}

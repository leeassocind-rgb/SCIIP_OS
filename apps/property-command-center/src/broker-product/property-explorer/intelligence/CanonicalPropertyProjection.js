// SCIIP Explorer 3.0 — M2.28
// Canonical Property Projection
//
// Stable, deterministic projection over the M2.27 governed read model.
// No base/source mutation. No event-store mutation. No automatic writes.

import{buildGovernedPropertyReadModel}from'./GovernedPropertyReadModel.js';

const freeze=x=>Object.freeze(x);

function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object'){
    return Object.keys(value).sort().reduce((out,key)=>{
      out[key]=stable(value[key]);
      return out;
    },{});
  }
  return value;
}

function hashText(text){
  let h=2166136261;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return (h>>>0).toString(16).padStart(8,'0');
}

function projectionFingerprint(payload){
  return `CPP-${hashText(JSON.stringify(stable(payload))).toUpperCase()}`;
}

function fieldProjection(readModel){
  const out={};
  for(const [fieldKey,state] of Object.entries(readModel?.fieldState||{})){
    out[fieldKey]=freeze({
      fieldKey,
      value:state?.effectiveValue??null,
      source:state?.source||'BASE_CANONICAL',
      overlayActive:Boolean(state?.overlayActive),
      executionId:state?.executionId||null,
      promotionDecisionId:state?.promotionDecisionId||null,
      evidenceEventId:state?.evidenceEventId||null,
      actor:state?.actor||null,
      governedAt:state?.governedAt||null
    });
  }
  return freeze(out);
}

export function buildCanonicalPropertyProjection(readModel,model=null){
  if(!readModel||readModel.status!=='ACTIVE'){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.28',
      schemaVersion:'1.0',
      projectionId:null,
      propertyKey:null,
      canonicalState:'NO_PROPERTY',
      property:null,
      fields:freeze({}),
      overlayCount:0,
      commandState:null,
      invariants:freeze({
        deterministic:true,
        readOnly:true,
        baseMutation:false,
        eventStoreMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  const fields=fieldProjection(readModel);
  const property=freeze({...readModel.property});
  const fingerprintPayload={
    schemaVersion:'1.0',
    propertyKey:readModel.propertyKey,
    canonicalState:readModel.canonicalState,
    property,
    fields
  };

  return freeze({
    status:'ACTIVE',
    milestone:'M2.28',
    schemaVersion:'1.0',
    projectionId:projectionFingerprint(fingerprintPayload),
    propertyKey:readModel.propertyKey,
    canonicalState:readModel.canonicalState,
    property,
    fields,
    overlayCount:readModel.overlays?.length||0,
    commandState:readModel.commandState||null,
    sourceReadModel:readModel,
    invariants:freeze({
      deterministic:true,
      readOnly:true,
      baseMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false,
      rollbackAware:true,
      propertyScoped:true
    })
  });
}

export function resolveCanonicalPropertyProjection(property,model=null){
  const readModel=buildGovernedPropertyReadModel(property,model);
  return buildCanonicalPropertyProjection(readModel,model);
}

export function projectedCanonicalValue(projection,fieldKey){
  return projection?.fields?.[fieldKey]?.value??projection?.property?.[fieldKey]??null;
}

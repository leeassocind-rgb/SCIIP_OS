// SCIIP Explorer 3.0 — M2.29
// Shared Governed Property Truth Contract
//
// Standard runtime interface for downstream property consumers.
// Source of truth: M2.28 Canonical Property Projection.
// No writes. No source mutation. No event-store mutation.

import{
  resolveCanonicalPropertyProjection,
  projectedCanonicalValue
}from'./CanonicalPropertyProjection.js';

const freeze=x=>Object.freeze(x);

function fieldMeta(projection,fieldKey){
  const f=projection?.fields?.[fieldKey];
  if(f)return f;
  const value=projection?.property?.[fieldKey]??null;
  return freeze({
    fieldKey,
    value,
    source:'BASE_CANONICAL',
    overlayActive:false,
    executionId:null,
    promotionDecisionId:null,
    evidenceEventId:null,
    actor:null,
    governedAt:null
  });
}

export function buildGovernedPropertyTruthContractFromProjection(projection){
  if(!projection||projection.status!=='ACTIVE'){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.29',
      contractVersion:'1.0',
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      property:null,
      fields:freeze({}),
      commandState:null,
      consumers:freeze([]),
      invariants:freeze({
        readOnly:true,
        deterministic:true,
        baseMutation:false,
        eventStoreMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  const contract={
    status:'ACTIVE',
    milestone:'M2.29',
    contractVersion:'1.0',
    propertyKey:projection.propertyKey,
    projectionId:projection.projectionId,
    canonicalState:projection.canonicalState,
    property:projection.property,
    fields:projection.fields,
    commandState:projection.commandState||null,
    consumers:freeze([
      'IntelligenceQuality',
      'IntelligenceGap',
      'GovernedPropertyState'
    ]),
    invariants:freeze({
      readOnly:true,
      deterministic:true,
      rollbackAware:true,
      propertyScoped:true,
      baseMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false,
      projectionAuthoritative:true
    })
  };

  return freeze(contract);
}

export function resolveGovernedPropertyTruthContract(property,model=null){
  const projection=resolveCanonicalPropertyProjection(property,model);
  return buildGovernedPropertyTruthContractFromProjection(projection);
}

export function readGovernedPropertyField(contract,fieldKey){
  return projectedCanonicalValue({
    property:contract?.property,
    fields:contract?.fields
  },fieldKey);
}

export function governedPropertyFieldMeta(contract,fieldKey){
  return fieldMeta(contract,fieldKey);
}

export function governedPropertyConsumerPayload(contract){
  return freeze({
    property:contract?.property||null,
    propertyKey:contract?.propertyKey||null,
    projectionId:contract?.projectionId||null,
    canonicalState:contract?.canonicalState||'NO_PROPERTY',
    fields:contract?.fields||freeze({}),
    commandState:contract?.commandState||null,
    governedTruth:contract
  });
}

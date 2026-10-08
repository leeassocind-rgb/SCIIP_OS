// SCIIP Explorer 3.0 — M2.30
// Governed Property Runtime Boundary
//
// Standard property-data boundary for Explorer runtime consumers.
// Authority: M2.29 Shared Governed Property Truth Contract.
// Read-only, projection-backed, rollback-aware, property-scoped.

import{
  buildGovernedPropertyTruthContractFromProjection,
  readGovernedPropertyField,
  governedPropertyFieldMeta,
  governedPropertyConsumerPayload
}from'./GovernedPropertyTruthContract.js';

const REGISTRY_KEY='__SCIIP_GOVERNED_PROPERTY_RUNTIME_V1__';
const freeze=x=>Object.freeze(x);

function registry(){
  const root=globalThis?.window||globalThis;
  if(!root[REGISTRY_KEY])root[REGISTRY_KEY]=new Map();
  return root[REGISTRY_KEY];
}

export function buildGovernedPropertyRuntimeBoundary(canonicalProjection){
  const truth=buildGovernedPropertyTruthContractFromProjection(canonicalProjection);

  if(!truth||truth.status!=='ACTIVE'){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.30',
      runtimeVersion:'1.0',
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      property:null,
      fields:freeze({}),
      truth,
      read:()=>null,
      fieldMeta:()=>null,
      consumerPayload:freeze({}),
      invariants:freeze({
        readOnly:true,
        projectionAuthoritative:true,
        baseMutation:false,
        eventStoreMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  const boundary={
    status:'ACTIVE',
    milestone:'M2.30',
    runtimeVersion:'1.0',
    propertyKey:truth.propertyKey,
    projectionId:truth.projectionId,
    canonicalState:truth.canonicalState,
    property:truth.property,
    fields:truth.fields,
    commandState:truth.commandState,
    truth,
    read:fieldKey=>readGovernedPropertyField(truth,fieldKey),
    fieldMeta:fieldKey=>governedPropertyFieldMeta(truth,fieldKey),
    consumerPayload:governedPropertyConsumerPayload(truth),
    invariants:freeze({
      readOnly:true,
      deterministic:true,
      rollbackAware:true,
      propertyScoped:true,
      projectionAuthoritative:true,
      sharedTruthAuthoritative:true,
      baseMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  };

  return freeze(boundary);
}

export function publishGovernedPropertyRuntime(boundary){
  if(!boundary||boundary.status!=='ACTIVE'||!boundary.propertyKey)return boundary;
  registry().set(String(boundary.propertyKey),boundary);

  try{
    globalThis?.window?.dispatchEvent(new CustomEvent(
      'sciip:governed-property-runtime-published',
      {detail:{
        propertyId:boundary.propertyKey,
        propertyKey:boundary.propertyKey,
        projectionId:boundary.projectionId,
        canonicalState:boundary.canonicalState
      }}
    ));
  }catch{}

  return boundary;
}

export function getGovernedPropertyRuntime(propertyKey){
  if(propertyKey===undefined||propertyKey===null)return null;
  return registry().get(String(propertyKey))||null;
}

export function clearGovernedPropertyRuntime(propertyKey){
  if(propertyKey===undefined||propertyKey===null)return false;
  return registry().delete(String(propertyKey));
}

export function explorerPropertyPayload(boundary){
  if(!boundary||boundary.status!=='ACTIVE'){
    return freeze({
      property:null,
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      governedRuntime:boundary||null
    });
  }

  return freeze({
    property:boundary.property,
    propertyKey:boundary.propertyKey,
    projectionId:boundary.projectionId,
    canonicalState:boundary.canonicalState,
    fields:boundary.fields,
    commandState:boundary.commandState,
    governedTruth:boundary.truth,
    governedRuntime:boundary
  });
}

// SCIIP Explorer 3.0 — M2.31
// Governed Explorer Consumer Migration
//
// Product-facing adapter for Explorer consumers.
// Resolves the M2.30 Governed Property Runtime Boundary from the selected
// canonical property without mutating source/evidence models.

import{resolveCanonicalPropertyProjection}from'./intelligence/CanonicalPropertyProjection.js';
import{
  buildGovernedPropertyRuntimeBoundary,
  explorerPropertyPayload
}from'./intelligence/GovernedPropertyRuntimeBoundary.js';

const freeze=x=>Object.freeze(x);

export function resolveGovernedExplorerConsumerRuntime(property,model=null){
  if(!property||typeof property!=='object'){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.31',
      property:null,
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      governedRuntime:null,
      consumerPayload:freeze({property:null}),
      invariants:freeze({
        sourceMutation:false,
        evidenceMutation:false,
        eventStoreMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  const projection=resolveCanonicalPropertyProjection(property,model);
  const governedRuntime=buildGovernedPropertyRuntimeBoundary(projection);
  const consumerPayload=explorerPropertyPayload(governedRuntime);

  return freeze({
    status:governedRuntime?.status||'NO_PROPERTY',
    milestone:'M2.31',
    property:consumerPayload.property||property,
    propertyKey:consumerPayload.propertyKey||null,
    projectionId:consumerPayload.projectionId||null,
    canonicalState:consumerPayload.canonicalState||'CANONICAL',
    governedRuntime,
    consumerPayload,
    invariants:freeze({
      sourceMutation:false,
      evidenceMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false,
      runtimeBoundaryAuthoritative:true,
      propertyScoped:true,
      rollbackAware:true
    })
  });
}

export function explorerConsumerProperty(property,model=null){
  return resolveGovernedExplorerConsumerRuntime(property,model).property||property;
}

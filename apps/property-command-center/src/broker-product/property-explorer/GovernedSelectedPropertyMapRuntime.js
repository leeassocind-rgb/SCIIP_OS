// SCIIP Explorer 3.0 — M2.32
// Governed Map Consumer Migration
//
// Selected-property map adapter only.
// Uses the M2.31 Explorer consumer runtime so map selection and Property
// Intelligence resolve from one governed effective property.
//
// Intentionally does NOT migrate:
// - base inventory-wide markers
// - neighbors
// - market radius/context metrics
// - global search
// - filters

import{resolveGovernedExplorerConsumerRuntime}from'./GovernedExplorerConsumerRuntime.js';

const freeze=x=>Object.freeze(x);

export function resolveGovernedSelectedPropertyMapRuntime(property,model=null){
  const consumer=resolveGovernedExplorerConsumerRuntime(property,model);

  if(!consumer||consumer.status!=='ACTIVE'||!consumer.property){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.32',
      sourceProperty:property||null,
      property:property||null,
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      mapProperty:property||null,
      invariants:freeze({
        selectedPropertyOnly:true,
        sourceMutation:false,
        mapWideMigration:false,
        automaticCanonicalWrites:false
      })
    });
  }

  const effective=consumer.property;

  return freeze({
    status:'ACTIVE',
    milestone:'M2.32',
    sourceProperty:property,
    property:effective,
    propertyKey:consumer.propertyKey,
    projectionId:consumer.projectionId,
    canonicalState:consumer.canonicalState,
    governedRuntime:consumer.governedRuntime,
    mapProperty:freeze({...effective}),
    invariants:freeze({
      selectedPropertyOnly:true,
      runtimeBoundaryAuthoritative:true,
      propertyIntelligenceParity:true,
      rollbackAware:true,
      sourceMutation:false,
      evidenceMutation:false,
      eventStoreMutation:false,
      mapWideMigration:false,
      automaticCanonicalWrites:false
    })
  });
}

export function selectedMapProperty(property,model=null){
  return resolveGovernedSelectedPropertyMapRuntime(property,model).mapProperty||property;
}

// SCIIP Explorer 3.0 — M2.35
// Live Market Context Consumer Binding
//
// Stable adapter for the visible Market Context / radius ribbon.
// Authority: M2.34 governed Market Context anchor.
//
// This module never mutates:
// - base/source property
// - inventory collections
// - radius result sets
// - aggregate logic
// - governance event stores

import{resolveGovernedMarketContextAnchor}from'./GovernedMarketContextAnchor.js';

const freeze=x=>Object.freeze(x);

export function resolveGovernedMarketContextConsumer(property,model=null){
  const anchor=resolveGovernedMarketContextAnchor(property,model);

  if(!anchor||anchor.status!=='ACTIVE'||!anchor.anchorProperty){
    return freeze({
      status:'NO_PROPERTY',
      milestone:'M2.35',
      sourceProperty:property||null,
      property:property||null,
      anchorProperty:property||null,
      propertyKey:null,
      projectionId:null,
      canonicalState:'NO_PROPERTY',
      invariants:freeze({
        ribbonConsumer:false,
        sourceMutation:false,
        inventoryMutation:false,
        aggregateLogicMutation:false,
        automaticCanonicalWrites:false
      })
    });
  }

  return freeze({
    status:'ACTIVE',
    milestone:'M2.35',
    sourceProperty:property,
    property:anchor.anchorProperty,
    anchorProperty:anchor.anchorProperty,
    propertyKey:anchor.propertyKey,
    projectionId:anchor.projectionId,
    canonicalState:anchor.canonicalState,
    governedRuntime:anchor.governedRuntime,
    invariants:freeze({
      ribbonConsumer:true,
      governedAnchorAuthoritative:true,
      mapSelectionParity:true,
      propertyIntelligenceParity:true,
      rollbackAware:true,
      sourceMutation:false,
      inventoryMutation:false,
      aggregateLogicMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function marketContextConsumerProperty(property,model=null){
  return resolveGovernedMarketContextConsumer(property,model).property||property;
}

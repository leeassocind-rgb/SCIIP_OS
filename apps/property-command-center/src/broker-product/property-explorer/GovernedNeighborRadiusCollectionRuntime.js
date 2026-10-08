// SCIIP Explorer 3.0 — M2.36
// Governed Neighbor / Radius Collection Runtime
//
// Projects derived neighbor/radius collections through the same governed
// runtime boundary used by the selected property.
//
// Source inventory arrays remain immutable.
// Aggregate Market Context formulas remain unchanged.

import{resolveGovernedExplorerConsumerRuntime}from'./GovernedExplorerConsumerRuntime.js';

const freeze=x=>Object.freeze(x);

function idOf(p){
  return p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
}

export function resolveGovernedNeighborRadiusCollection(properties=[],modelFactory=null){
  const source=Array.isArray(properties)?properties:[];
  const rows=source.map(property=>{
    const model=typeof modelFactory==='function'?modelFactory(property):{property};
    const runtime=resolveGovernedExplorerConsumerRuntime(property,model);
    return freeze({
      sourceProperty:property,
      property:runtime?.property||property,
      propertyKey:runtime?.propertyKey||idOf(property),
      projectionId:runtime?.projectionId||null,
      canonicalState:runtime?.canonicalState||'CANONICAL',
      governedRuntime:runtime?.governedRuntime||null
    });
  });

  return freeze({
    status:'ACTIVE',
    milestone:'M2.36',
    sourceCount:source.length,
    count:rows.length,
    properties:freeze(rows.map(x=>x.property)),
    rows:freeze(rows),
    invariants:freeze({
      derivedCollection:true,
      runtimeBoundaryAuthoritative:true,
      sourceArrayMutation:false,
      sourcePropertyMutation:false,
      aggregateLogicMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function governedNeighborProperties(properties=[],modelFactory=null){
  return resolveGovernedNeighborRadiusCollection(properties,modelFactory).properties;
}

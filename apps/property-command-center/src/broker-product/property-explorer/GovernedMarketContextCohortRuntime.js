// SCIIP Explorer 3.0 — M2.37
// Governed Market Context Cohort Runtime
//
// Projects the Market Context candidate/cohort input collection through the
// governed property runtime before aggregate formulas execute.
//
// This DOES NOT mutate:
// - EXPLORER3_PROPERTIES
// - map-wide marker inventory
// - filters
// - Market Context formulas
// - governance event stores

import{resolveGovernedNeighborRadiusCollection}from'./GovernedNeighborRadiusCollectionRuntime.js';

const freeze=x=>Object.freeze(x);

export function resolveGovernedMarketContextCohort(properties=[]){
  const source=Array.isArray(properties)?properties:[];
  const collection=resolveGovernedNeighborRadiusCollection(source);

  return freeze({
    status:'ACTIVE',
    milestone:'M2.37',
    sourceCount:source.length,
    count:collection.count,
    sourceProperties:source,
    properties:collection.properties,
    rows:collection.rows,
    invariants:freeze({
      governedCohort:true,
      runtimeBoundaryAuthoritative:true,
      sourceArrayMutation:false,
      sourcePropertyMutation:false,
      mapInventoryMutation:false,
      filterLogicMutation:false,
      aggregateLogicMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function governedMarketContextProperties(properties=[]){
  return resolveGovernedMarketContextCohort(properties).properties;
}

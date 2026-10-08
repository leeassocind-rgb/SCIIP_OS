// SCIIP Explorer 3.0 — M2.43
// Governed Market Spatial Selection Synchronization
//
// Synchronizes map / neighbor / focus property interactions with the governed
// Market Context detail + spatial-highlight state without mutating canonical truth.

const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function resolveGovernedMarketSpatialSelection(
  value,
  metricDetailContext=null,
  spatialHighlightContext=null,
  origin='MAP'
){
  const propertyId=propertyIdOf(value);
  const highlighted=Array.isArray(spatialHighlightContext?.highlightedPropertyIds)
    ? spatialHighlightContext.highlightedPropertyIds.includes(propertyId)
    : false;
  const inCohort=Array.isArray(spatialHighlightContext?.cohortPropertyIds)
    ? spatialHighlightContext.cohortPropertyIds.includes(propertyId)
    : false;

  return freeze({
    status:propertyId?'ACTIVE':'NO_SELECTION',
    milestone:'M2.43',
    propertyId,
    origin:String(origin||'MAP').toUpperCase(),
    metricId:
      metricDetailContext?.metric?.id||
      spatialHighlightContext?.metricId||
      null,
    mode:spatialHighlightContext?.mode||'market',
    highlighted,
    inCohort,
    sourceValue:value,
    invariants:freeze({
      governedSpatialStateAuthoritative:true,
      selectedPropertyFlowPreserved:true,
      focusFlowPreserved:true,
      neighborOpenFlowPreserved:true,
      mapInteractionFlowPreserved:true,
      sourceInventoryMutation:false,
      filterMutation:false,
      formulaMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

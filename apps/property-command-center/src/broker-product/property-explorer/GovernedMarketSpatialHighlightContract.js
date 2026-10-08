// SCIIP Explorer 3.0 — M2.42 corrected
// Governed Market Spatial Highlight Consumer Binding

const freeze=x=>Object.freeze(x);

export function buildGovernedMarketSpatialHighlightContract(detailContext,marketContext,drawerSection){
  const metric=detailContext?.metric||null;
  const rows=Array.isArray(metric?.rows)?metric.rows:[];
  const highlightedPropertyIds=freeze(
    rows.map(row=>row?.propertyId).filter(Boolean)
  );
  const cohortPropertyIds=freeze(
    (Array.isArray(marketContext?.cohort)?marketContext.cohort:[])
      .map(row=>row?.id)
      .filter(Boolean)
  );

  return freeze({
    status:'ACTIVE',
    milestone:'M2.42',
    mode:drawerSection==='neighbors'?'neighbors':'market',
    highlightedPropertyIds,
    cohortPropertyIds,
    metricId:metric?.id||null,
    invariants:freeze({
      governedMetricRowsAuthoritative:true,
      showOnMapHighlightPathPreserved:true,
      cohortPreserved:true,
      neighborModePreserved:true,
      formulaMutation:false,
      sourceInventoryMutation:false,
      filterMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

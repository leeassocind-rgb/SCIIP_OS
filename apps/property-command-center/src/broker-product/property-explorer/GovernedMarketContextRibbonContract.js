// SCIIP Explorer 3.0 — M2.40
// Governed Market Context Ribbon Consumer Contract
//
// Converts the M2.38 governed metric presentation into the exact context shape
// expected by the live MarketContextRibbon while preserving metric ids,
// subtitles, rows, drilldown semantics, radius state, and existing formulas.

const freeze=x=>Object.freeze(x);

export function buildGovernedMarketContextRibbonContract(marketContext,presentation){
  const source=marketContext||{};
  const p=presentation||{};
  const order=Array.isArray(p.order)?p.order:[];
  const metrics=p.metrics||{};

  const governedMetrics=order.map(key=>{
    const metric=metrics[key];
    if(!metric)return null;
    const raw=metric.raw||{};
    return freeze({
      ...raw,
      id:raw.id||metric.sourceMetricId||key,
      label:raw.label||metric.label||key,
      subtitle:raw.subtitle||'',
      value:metric.value,
      rows:Array.isArray(metric.rows)?metric.rows:(Array.isArray(raw.rows)?raw.rows:[])
    });
  }).filter(Boolean);

  return freeze({
    ...source,
    metrics:freeze(governedMetrics),
    governedMetricPresentation:p,
    governedRibbonContract:true,
    invariants:freeze({
      presentationAuthoritative:true,
      sourceContextMutation:false,
      formulaMutation:false,
      drilldownRowsPreserved:true,
      radiusStatePreserved:true,
      filterStatePreserved:true,
      automaticCanonicalWrites:false
    })
  });
}

const freeze=v=>Object.freeze(v);

export function simulatePortfolio({assets=[],scenario={}}={}) {
  const revenueFactor=Number(scenario.revenueFactor??1);
  const costFactor=Number(scenario.costFactor??1);
  const riskFactor=Number(scenario.riskFactor??1);

  const rows=assets.map(asset=>{
    const revenue=Number(asset.revenue||0)*revenueFactor;
    const cost=Number(asset.cost||0)*costFactor;
    const margin=Number((revenue-cost).toFixed(2));
    const risk=Number((Number(asset.riskScore||0)*riskFactor).toFixed(2));
    return freeze({
      ...asset,
      simulatedRevenue:Number(revenue.toFixed(2)),
      simulatedCost:Number(cost.toFixed(2)),
      simulatedMargin:margin,
      simulatedRisk:risk,
      status:margin>=0&&risk<70?'RESILIENT':'AT_RISK'
    });
  });

  return freeze({
    assets:freeze(rows),
    total:rows.length,
    resilient:rows.filter(r=>r.status==='RESILIENT').length,
    atRisk:rows.filter(r=>r.status==='AT_RISK').length,
    totalMargin:Number(rows.reduce((sum,r)=>sum+r.simulatedMargin,0).toFixed(2)),
    scenario:freeze({...scenario}),
    assumptionsVisible:true,
    autonomousReallocationAllowed:false
  });
}

const freeze = value => Object.freeze(value);

export function runEnterpriseStressTests({baseline={},tests=[]}={}) {
  const results = tests.map(test => {
    const revenue = Number(baseline.revenue || 0) * Number(test.revenueMultiplier || 1);
    const cost = Number(baseline.cost || 0) * Number(test.costMultiplier || 1);
    const liquidity = Number(baseline.liquidity || 0) + Number(test.liquidityDelta || 0);
    const capacity = Number(baseline.capacity || 0) * Number(test.capacityMultiplier || 1);
    const resilienceScore = Number((
      Math.max(0, revenue - cost) * .01 +
      Math.max(0, liquidity) * .02 +
      Math.max(0, capacity) * .10
    ).toFixed(2));

    return freeze({
      testId:test.testId,
      label:test.label,
      revenue:Number(revenue.toFixed(2)),
      cost:Number(cost.toFixed(2)),
      liquidity:Number(liquidity.toFixed(2)),
      capacity:Number(capacity.toFixed(2)),
      resilienceScore,
      status:resilienceScore >= 70 ? 'RESILIENT' : resilienceScore >= 40 ? 'WATCH' : 'VULNERABLE',
      assumptions:freeze({...test})
    });
  });

  return freeze({
    tests:freeze(results),
    total:results.length,
    vulnerable:results.filter(r=>r.status==='VULNERABLE').length,
    assumptionsVisible:true,
    sensitivityAnalysis:true,
    executiveReviewRequired:true,
    autonomousRemediationAllowed:false
  });
}

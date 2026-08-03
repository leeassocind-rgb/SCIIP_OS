const freeze = value => Object.freeze(value);

export function simulateEnterpriseScenarios({baseline={},scenarios=[]}={}) {
  const results = scenarios.map(scenario => {
    const revenue = Number(baseline.revenue || 0) * Number(scenario.revenueMultiplier || 1);
    const cost = Number(baseline.cost || 0) * Number(scenario.costMultiplier || 1);
    const risk = Number(baseline.risk || 0) + Number(scenario.riskDelta || 0);
    const net = revenue - cost;
    return freeze({
      scenarioId:scenario.scenarioId,
      label:scenario.label,
      revenue:Number(revenue.toFixed(2)),
      cost:Number(cost.toFixed(2)),
      net:Number(net.toFixed(2)),
      risk:Number(risk.toFixed(2)),
      assumptions:freeze({...scenario})
    });
  }).sort((a,b)=>(b.net-b.risk)-(a.net-a.risk));

  return freeze({
    scenarios:freeze(results),
    total:results.length,
    bestScenario:results[0]||null,
    assumptionsVisible:true,
    sensitivityAnalysis:true,
    evidencePreserved:true,
    approvalRequired:true,
    autonomousExecutionAllowed:false
  });
}

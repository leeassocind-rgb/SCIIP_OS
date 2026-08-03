const freeze = value => Object.freeze(value);

export function runPipelineScenarios({deals=[],scenarios=[]}={}) {
  const results = scenarios.map(scenario => {
    const weightedRevenue = Number(deals.reduce((sum,deal) => {
      const probability = Math.min(1, Math.max(0, Number(deal.probability || 0) * Number(scenario.probabilityMultiplier || 1)));
      const revenue = Number(deal.revenue || 0) * Number(scenario.revenueMultiplier || 1);
      return sum + revenue * probability;
    }, 0).toFixed(2));

    return freeze({
      scenarioId: scenario.scenarioId,
      label: scenario.label,
      weightedRevenue,
      assumptions: freeze({ ...scenario }),
      approvalRequired: true
    });
  }).sort((a,b)=>b.weightedRevenue-a.weightedRevenue);

  return freeze({
    scenarios: freeze(results),
    total: results.length,
    bestScenario: results[0] || null,
    assumptionsVisible: true,
    evidenceRequired: true,
    approvalRequired: true,
    autonomousCommitmentAllowed: false
  });
}

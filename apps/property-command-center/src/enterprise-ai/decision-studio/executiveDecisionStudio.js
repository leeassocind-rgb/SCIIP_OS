const freeze=value=>Object.freeze(value);

export function evaluateExecutiveDecision({
  decisionId,
  scenarios=[],
  weights={}
}={}) {
  if(!decisionId) throw new Error('decisionId is required');

  const scored=scenarios.map(scenario=>{
    const dimensions=scenario.dimensions||{};
    const score=Object.entries(dimensions).reduce(
      (sum,[key,value])=>sum+(Number(value||0)*Number(weights[key]??1)),
      0
    );
    return freeze({
      ...scenario,
      score:Number(score.toFixed(2)),
      evidenceCount:Number(scenario.evidenceCount||0)
    });
  }).sort((a,b)=>b.score-a.score);

  const winner=scored[0]||null;
  return freeze({
    decisionId,
    scenarios:freeze(scored),
    winner,
    scenarioCount:scored.length,
    evidenceRequired:true,
    approvalRequired:true,
    confidenceVisible:true,
    productionExecutionAuthorized:false
  });
}

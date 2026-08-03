const freeze=v=>Object.freeze(v);

export function compareScenarios({scenarios=[]}={}) {
  const rows=scenarios.map(scenario=>{
    const score=Number((
      Number(scenario.valueScore||0)*.4+
      Number(scenario.resilienceScore||0)*.3+
      Number(scenario.confidence||0)*20-
      Number(scenario.riskScore||0)*.2
    ).toFixed(2));
    return freeze({
      ...scenario,
      score,
      status:Number(scenario.confidence||0)>=.75?'READY_FOR_REVIEW':'LOW_CONFIDENCE',
      approvalRequired:true
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    scenarios:freeze(rows),
    total:rows.length,
    reviewReady:rows.filter(r=>r.status==='READY_FOR_REVIEW').length,
    recommendedScenario:rows.find(r=>r.status==='READY_FOR_REVIEW')||null,
    assumptionsVisible:true,
    executiveApprovalRequired:true,
    autonomousScenarioSelectionAllowed:false
  });
}

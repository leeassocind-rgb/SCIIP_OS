const freeze=value=>Object.freeze(value);

function normalize(value,min=0,max=100){
  const number=Number(value||0);
  return Math.max(min,Math.min(max,number));
}

function scoreScenario(scenario,weights){
  const revenue=normalize(scenario.revenueScore);
  const strategic=normalize(scenario.strategicFitScore);
  const timing=normalize(scenario.timingScore);
  const confidence=normalize(scenario.confidenceScore);
  const risk=normalize(scenario.riskScore);
  const capital=normalize(scenario.capitalEfficiencyScore);

  return Number((
    revenue*weights.revenue +
    strategic*weights.strategic +
    timing*weights.timing +
    confidence*weights.confidence +
    capital*weights.capital -
    risk*weights.risk
  ).toFixed(2));
}

export function simulateExecutiveScenarios({
  scenarios=[],
  weights={
    revenue:0.25,
    strategic:0.2,
    timing:0.15,
    confidence:0.15,
    capital:0.15,
    risk:0.1
  }
}={}) {
  const evaluated=scenarios.map((scenario,index)=>{
    const simulationScore=scoreScenario(scenario,weights);
    const evidence=Array.isArray(scenario.evidence)?scenario.evidence:[];
    return freeze({
      scenarioId:scenario.scenarioId||`SCENARIO-${index+1}`,
      name:scenario.name||`Scenario ${index+1}`,
      type:scenario.type||'ENTERPRISE',
      simulationScore,
      confidence:Number(normalize(scenario.confidenceScore)/100),
      evidence:freeze(evidence.map(item=>freeze({...item}))),
      evidenceCount:evidence.length,
      assumptions:freeze([...(scenario.assumptions||[])]),
      risks:freeze([...(scenario.risks||[])]),
      status:evidence.length?'SIMULATED':'INSUFFICIENT_EVIDENCE',
      approvalRequired:true,
      executionAuthorized:false
    });
  }).sort((a,b)=>b.simulationScore-a.simulationScore);

  const winner=evaluated.find(item=>item.status==='SIMULATED')||null;

  return freeze({
    scenarios:freeze(evaluated),
    total:evaluated.length,
    simulated:evaluated.filter(item=>item.status==='SIMULATED').length,
    winner,
    ranked:true,
    evidenceBacked:true,
    approvalRequired:true,
    executionAuthorized:false
  });
}

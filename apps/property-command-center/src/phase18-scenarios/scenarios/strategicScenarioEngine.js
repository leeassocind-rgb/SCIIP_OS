const freeze=v=>Object.freeze(v);

export function buildStrategicScenarios({scenarios=[],assumptions=[]}={}) {
  const assumptionMap=new Map(assumptions.map(a=>[a.assumptionId,a]));
  const rows=scenarios.map(scenario=>{
    const linked=(scenario.assumptionIds||[]).map(id=>assumptionMap.get(id)).filter(Boolean);
    const confidence=linked.length
      ? Number((linked.reduce((sum,a)=>sum+Number(a.confidence||0),0)/linked.length).toFixed(3))
      : 0;
    return freeze({
      ...scenario,
      assumptions:freeze(linked),
      assumptionCount:linked.length,
      confidence,
      status:linked.length?'SCENARIO_READY':'ASSUMPTIONS_MISSING',
      executiveReviewRequired:true
    });
  });

  return freeze({
    scenarios:freeze(rows),
    total:rows.length,
    ready:rows.filter(r=>r.status==='SCENARIO_READY').length,
    missingAssumptions:rows.filter(r=>r.status==='ASSUMPTIONS_MISSING').length,
    assumptionsVisible:true,
    permanentScenarioHistory:true,
    autonomousScenarioSelectionAllowed:false
  });
}

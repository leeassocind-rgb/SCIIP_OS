const freeze=v=>Object.freeze(v);

export function stressTestCapitalPlan({plan=[],scenarios=[]}={}) {
  const results=scenarios.map(scenario=>{
    const revenueFactor=Number(scenario.revenueFactor??1);
    const costFactor=Number(scenario.costFactor??1);
    const lossFactor=Number(scenario.lossFactor??0);

    const items=plan.map(item=>{
      const revenue=Number(item.expectedRevenue||0)*revenueFactor;
      const cost=Number(item.expectedCost||0)*costFactor;
      const loss=Number(item.capital||0)*lossFactor;
      const net=Number((revenue-cost-loss).toFixed(2));
      return freeze({...item,simulatedNet:net,status:net>=0?'RESILIENT':'AT_RISK'});
    });

    return freeze({
      scenarioId:scenario.scenarioId,
      items:freeze(items),
      totalNet:Number(items.reduce((sum,i)=>sum+i.simulatedNet,0).toFixed(2)),
      atRisk:items.filter(i=>i.status==='AT_RISK').length
    });
  });

  return freeze({
    scenarios:freeze(results),
    total:results.length,
    assumptionsVisible:true,
    stressEvidencePreserved:true,
    autonomousPlanChangesAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function createExecutiveCapitalPlanning({allocation={},resources={},portfolio={},stress={},approvals=[]}={}) {
  const attention=[
    ...(allocation.initiatives||[]).filter(i=>i.status==='DEFERRED').map(i=>freeze({type:'CAPITAL',id:i.initiativeId})),
    ...(resources.demands||[]).filter(d=>d.status==='CAPACITY_CONSTRAINED').map(d=>freeze({type:'RESOURCE',id:d.demandId})),
    ...(portfolio.investments||[]).filter(i=>i.status==='LOW_CONFIDENCE').map(i=>freeze({type:'INVESTMENT',id:i.investmentId})),
    ...(stress.scenarios||[]).filter(s=>s.atRisk>0).map(s=>freeze({type:'STRESS',id:s.scenarioId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    allocation:freeze({...allocation}),
    resources:freeze({...resources}),
    portfolio:freeze({...portfolio}),
    stress:freeze({...stress}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    executiveCapitalPlanningReady:true,
    executiveApprovalRequired:true,
    autonomousAllocationAllowed:false,
    autonomousInvestmentSelectionAllowed:false
  });
}

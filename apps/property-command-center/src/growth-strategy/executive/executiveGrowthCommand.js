const freeze = value => Object.freeze(value);

export function createExecutiveGrowthCommand({accounts=[],territories=[],scenarios=[],capacity=[],approvals=[]}={}) {
  const attention = [
    ...accounts.filter(item=>item.status==='PRIORITY_GROWTH').map(item=>freeze({type:'ACCOUNT',id:item.accountId,score:item.score})),
    ...territories.filter(item=>item.status==='EXPANSION_CANDIDATE').map(item=>freeze({type:'TERRITORY',id:item.territoryId,score:item.score})),
    ...capacity.filter(item=>item.status==='OVER_CAPACITY').map(item=>freeze({type:'CAPACITY',id:item.teamId})),
    ...approvals.filter(item=>item.status==='PENDING').map(item=>freeze({type:'APPROVAL',id:item.approvalId}))
  ];

  return freeze({
    accounts: freeze([...accounts]),
    territories: freeze([...territories]),
    scenarios: freeze([...scenarios]),
    capacity: freeze([...capacity]),
    approvals: freeze([...approvals]),
    attention: freeze(attention),
    attentionCount: attention.length,
    executivePlanningReady: true,
    evidenceBacked: true,
    approvalRequired: true,
    autonomousExecutionAllowed: false
  });
}

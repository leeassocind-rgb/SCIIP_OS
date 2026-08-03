const freeze = value => Object.freeze(value);

export function createEnterprisePlanningCommand({forecasts=[],capitalPlans=[],scenarios=[],decisions=[],approvals=[]}={}) {
  const attention = [
    ...capitalPlans.filter(item=>item.status==='RECOMMENDED').map(item=>freeze({type:'CAPITAL',id:item.opportunityId,score:item.score})),
    ...decisions.filter(item=>item.status==='READY_FOR_EXECUTIVE_REVIEW').map(item=>freeze({type:'DECISION',id:item.decisionId,score:item.score})),
    ...approvals.filter(item=>item.status==='PENDING').map(item=>freeze({type:'APPROVAL',id:item.approvalId}))
  ];

  return freeze({
    forecasts:freeze([...forecasts]),
    capitalPlans:freeze([...capitalPlans]),
    scenarios:freeze([...scenarios]),
    decisions:freeze([...decisions]),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    strategicPlanningReady:true,
    executiveApprovalRequired:true,
    autonomousExecutionAllowed:false,
    autonomousCapitalDeploymentAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function createBrokerageOperationsReview({communications=[],workflows=[],milestones=[],deliveries=[],approvals=[]}={}) {
  const attention=[
    ...communications.filter(item=>item.status!=='READY_FOR_BROKER_REVIEW').map(item=>freeze({type:'COMMUNICATION',id:item.communicationId})),
    ...workflows.filter(item=>item.status==='BLOCKED').map(item=>freeze({type:'WORKFLOW',id:item.stepId})),
    ...milestones.filter(item=>item.overdue||item.atRisk).map(item=>freeze({type:'MILESTONE',id:item.milestoneId})),
    ...deliveries.filter(item=>item.status==='BLOCKED').map(item=>freeze({type:'DELIVERY',id:item.sectionId})),
    ...approvals.filter(item=>item.status==='PENDING').map(item=>freeze({type:'APPROVAL',id:item.approvalId}))
  ];

  return freeze({
    communications:freeze([...communications]),
    workflows:freeze([...workflows]),
    milestones:freeze([...milestones]),
    deliveries:freeze([...deliveries]),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    evidenceBacked:true,
    brokerReviewRequired:true,
    autonomousExecutionAllowed:false,
    autonomousPublishingAllowed:false
  });
}

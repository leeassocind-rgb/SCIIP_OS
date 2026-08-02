const freeze = value => Object.freeze(value);

export function createExecutiveAssignmentCommand({
  assignment,
  orchestration={},
  decisionSupport={},
  relationshipPlans={},
  workflow={},
  approvals=[]
}={}) {
  const commands = [
    ...(orchestration.workstreams || []).filter(item=>item.status!=='READY').map(item=>freeze({type:'WORKSTREAM',id:item.workstreamId,priority:item.status==='AT_RISK'?'HIGH':'MEDIUM'})),
    ...(relationshipPlans.plans || []).filter(item=>item.recommendedAction==='CONTACT_NOW').map(item=>freeze({type:'RELATIONSHIP',id:item.actionId,priority:'HIGH'})),
    ...(workflow.tasks || []).filter(item=>['BLOCKED','OVERDUE'].includes(item.status)).map(item=>freeze({type:'WORKFLOW',id:item.taskId,priority:item.status==='OVERDUE'?'HIGH':'MEDIUM'})),
    ...approvals.filter(item=>item.status==='PENDING').map(item=>freeze({type:'APPROVAL',id:item.approvalId,priority:'HIGH'}))
  ];

  return freeze({
    assignment: freeze({...assignment}),
    orchestration: freeze({...orchestration}),
    decisionSupport: freeze({...decisionSupport}),
    relationshipPlans: freeze({...relationshipPlans}),
    workflow: freeze({...workflow}),
    approvals: freeze([...approvals]),
    commands: freeze(commands),
    commandCount: commands.length,
    evidenceBacked: true,
    executiveReviewRequired: true,
    brokerControlPreserved: true,
    autonomousExecutionAllowed: false
  });
}

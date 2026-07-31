export function generateExecutivePlaybook({decisionId,scorecards=[]}={}){
  const steps=scorecards.slice(0,3).map((card,index)=>Object.freeze({sequence:index+1,alternativeId:card.alternativeId,instruction:`Evaluate alternative ${card.alternativeId} through the governed human approval process.`,approvalRequired:true,executionAuthorized:false}));
  return Object.freeze({playbookId:`PLAYBOOK:${decisionId}`,decisionId,status:'ADVISORY_DRAFT',steps:Object.freeze(steps),humanApprovalRequired:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false});
}

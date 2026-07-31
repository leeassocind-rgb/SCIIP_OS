import{freezeDeep}from'./_shared.js';

export function evaluateExecutiveGovernanceReviewPolicy({recommendation,decision,conflictResolution}={}){
  const reasons=[];
  if(!recommendation)reasons.push('RECOMMENDATION_NOT_FOUND');
  if(!decision?.humanDecision)reasons.push('HUMAN_DECISION_REQUIRED');
  if(decision?.disposition==='APPROVED'&&!decision?.evidenceIds?.length)reasons.push('APPROVAL_EVIDENCE_REQUIRED');
  if((recommendation?.conflictIds||[]).length&&!conflictResolution)reasons.push('CONFLICT_RESOLUTION_REQUIRED');
  const passed=reasons.length===0;
  return freezeDeep({
    passed,
    status:passed?'REVIEW_POLICY_PASSED':'REVIEW_POLICY_BLOCKED',
    reasons,
    humanApprovalRequired:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

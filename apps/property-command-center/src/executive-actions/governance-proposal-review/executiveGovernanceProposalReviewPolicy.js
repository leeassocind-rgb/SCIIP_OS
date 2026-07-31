import{freezeDeep}from'./_shared.js';

export function evaluateExecutiveGovernanceProposalReviewPolicy({
  bridgeResult,decision
}={}){
  const reasons=[];
  if(!bridgeResult?.proposal?.id)reasons.push('PROPOSAL_NOT_FOUND');
  if(bridgeResult?.status!=='READY_FOR_GOVERNED_PROPOSAL_REVIEW'){
    reasons.push('PROPOSAL_NOT_READY_FOR_REVIEW');
  }
  if(!decision?.humanDecision)reasons.push('HUMAN_DECISION_REQUIRED');
  if(decision?.disposition==='APPROVED'&&!decision?.evidenceIds?.length){
    reasons.push('APPROVAL_EVIDENCE_REQUIRED');
  }
  if(bridgeResult?.proposal?.dispatchAllowed)reasons.push('DIRECT_DISPATCH_FORBIDDEN');
  if(bridgeResult?.proposal?.workflowMutationAllowed)reasons.push('WORKFLOW_MUTATION_FORBIDDEN');
  if(bridgeResult?.proposal?.autonomousExecutionAllowed)reasons.push('AUTONOMOUS_EXECUTION_FORBIDDEN');
  return freezeDeep({
    passed:reasons.length===0,
    status:reasons.length?'PROPOSAL_REVIEW_POLICY_BLOCKED':'PROPOSAL_REVIEW_POLICY_PASSED',
    reasons,
    humanApprovalRequired:true,
    orchestrationSubmissionAllowed:reasons.length===0&&decision?.disposition==='APPROVED',
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

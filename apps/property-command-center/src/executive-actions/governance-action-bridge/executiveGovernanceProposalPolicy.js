import{freezeDeep}from'./_shared.js';

export function evaluateExecutiveGovernanceProposalPolicy({approvedDecision,recommendation,proposal}={}){
  const reasons=[];
  if(!approvedDecision?.humanApproved)reasons.push('HUMAN_APPROVAL_REQUIRED');
  if(!recommendation?.humanApprovalRequired)reasons.push('RECOMMENDATION_GOVERNANCE_INVALID');
  if(!proposal?.evidenceIds?.length)reasons.push('PROPOSAL_EVIDENCE_REQUIRED');
  if(proposal?.dispatchAllowed)reasons.push('DIRECT_DISPATCH_FORBIDDEN');
  if(proposal?.autonomousExecutionAllowed)reasons.push('AUTONOMOUS_EXECUTION_FORBIDDEN');
  if(proposal?.workflowMutationAllowed)reasons.push('WORKFLOW_MUTATION_FORBIDDEN');
  return freezeDeep({
    passed:reasons.length===0,
    status:reasons.length?'PROPOSAL_POLICY_BLOCKED':'PROPOSAL_POLICY_PASSED',
    reasons,
    humanApprovalRequired:true,
    dispatchAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

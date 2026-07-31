import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceProposalReviewScorecard({
  id,bridgeResult,decision,policy,submission
}={}){
  return freezeDeep({
    id:String(id),
    bridgeResultId:bridgeResult.id,
    proposalId:bridgeResult.proposal.id,
    disposition:decision.disposition,
    policyStatus:policy.status,
    orchestrationSubmitted:Boolean(submission),
    submissionStatus:submission?.submissionStatus||'NOT_SUBMITTED',
    humanApprovalRecorded:Boolean(submission?.humanApprovalRecorded),
    executionAuthorized:false,
    appendOnly:true,
    readOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}

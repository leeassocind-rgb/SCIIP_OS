import{freezeDeep,uniq,now}from'./_shared.js';

export function createExecutiveGovernanceRuntimeSignal({submission,clock}={}){
  if(!submission?.id)throw new Error('Governance orchestration submission is required');
  if(submission.submissionStatus!=='SUBMITTED_TO_EXISTING_ORCHESTRATOR'){
    throw new Error('Submission must target the existing orchestrator');
  }
  if(!submission.humanApprovalRecorded)throw new Error('Human approval record is required');
  if(submission.executionAuthorized)throw new Error('Execution-authorized submissions are not accepted');
  return freezeDeep({
    id:`EXEC-SIGNAL:${submission.id}`,
    type:'EXECUTIVE_GOVERNANCE_ACTION_PROPOSAL_SUBMITTED',
    source:'executive-governance-action-proposal-review-orchestration-submission',
    subjectId:submission.payload?.subjectId||null,
    certificationId:submission.payload?.certificationId||null,
    proposalId:submission.proposalId,
    recommendationId:submission.payload?.recommendationId||null,
    decisionId:submission.payload?.decisionId||null,
    submissionId:submission.id,
    priorityScore:Number(submission.payload?.priorityScore)||0,
    confidence:Number(submission.payload?.confidence)||0,
    evidenceIds:uniq(submission.evidenceIds),
    sourceSignalIds:uniq(submission.sourceSignalIds),
    emittedAt:now(clock),
    humanApprovalRecorded:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

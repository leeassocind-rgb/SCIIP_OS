import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveGovernanceOrchestrationSubmission({
  id,bridgeResult,decision,policy
}={}){
  if(!id)throw new Error('Submission id is required');
  if(decision?.disposition!=='APPROVED')throw new Error('Only approved proposals may be submitted');
  if(!policy?.passed||!policy?.orchestrationSubmissionAllowed){
    throw new Error('Proposal review policy must allow orchestration submission');
  }
  return freezeDeep({
    id:String(id),
    proposalId:bridgeResult.proposal.id,
    envelopeId:bridgeResult.envelope.id,
    targetCapability:bridgeResult.envelope.targetCapability,
    submittedBy:decision.actorId,
    submittedAt:new Date().toISOString(),
    submissionStatus:'SUBMITTED_TO_EXISTING_ORCHESTRATOR',
    payload:{
      proposalType:bridgeResult.proposal.proposalType,
      title:bridgeResult.proposal.title,
      description:bridgeResult.proposal.description,
      priorityScore:bridgeResult.proposal.priorityScore,
      confidence:bridgeResult.proposal.confidence,
      subjectId:bridgeResult.proposal.subjectId,
      certificationId:bridgeResult.proposal.certificationId,
      recommendationId:bridgeResult.proposal.recommendationId,
      decisionId:bridgeResult.proposal.decisionId
    },
    evidenceIds:uniq([
      ...(bridgeResult.proposal.evidenceIds||[]),
      ...(decision.evidenceIds||[])
    ]),
    sourceSignalIds:uniq([
      ...(bridgeResult.proposal.sourceSignalIds||[]),
      ...(decision.sourceSignalIds||[])
    ]),
    humanApprovalRecorded:true,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

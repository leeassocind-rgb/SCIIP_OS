import{freezeDeep,uniq}from'./_shared.js';

const actionMap={
  RETEST_CONTROL:'GOVERNANCE_CONTROL_RETEST',
  REVALIDATE_POLICY:'GOVERNANCE_POLICY_REVALIDATION',
  REVERIFY_EVIDENCE:'GOVERNANCE_EVIDENCE_REVERIFICATION',
  REASSESS_READINESS:'GOVERNANCE_READINESS_REASSESSMENT',
  REVIEW_EXCEPTION:'GOVERNANCE_EXCEPTION_REVIEW',
  REVIEW_GOVERNANCE_DRIFT:'GOVERNANCE_DRIFT_REVIEW'
};

export function mapExecutiveGovernanceDecisionToActionProposal({approvedDecision,recommendation}={}){
  if(!approvedDecision?.humanApproved)throw new Error('Approved governance decision is required');
  if(!recommendation?.id)throw new Error('Recommendation is required');
  if(recommendation.id!==approvedDecision.recommendationId)throw new Error('Recommendation mismatch');
  const proposalType=actionMap[recommendation.action]||'GOVERNANCE_REVIEW_ACTION';
  return freezeDeep({
    id:`GOV-PROP:${approvedDecision.id}`,
    proposalType,
    title:recommendation.title||recommendation.action,
    description:recommendation.rationale||approvedDecision.reason,
    priorityScore:Number(recommendation.priorityScore)||0,
    confidence:Number(recommendation.confidence)||0,
    subjectId:recommendation.subjectId||null,
    certificationId:recommendation.certificationId||null,
    advisoryId:approvedDecision.advisoryId,
    recommendationId:recommendation.id,
    decisionId:approvedDecision.id,
    approvedBy:approvedDecision.actorId,
    approvalReason:approvedDecision.reason,
    evidenceIds:uniq([
      ...(approvedDecision.evidenceIds||[]),
      ...(recommendation.evidenceIds||[])
    ]),
    sourceSignalIds:uniq([
      ...(approvedDecision.sourceSignalIds||[]),
      ...(recommendation.sourceSignalIds||[])
    ]),
    status:'PENDING_ACTION_PROPOSAL_REVIEW',
    humanApprovalRequired:true,
    autonomousExecutionAllowed:false,
    workflowMutationAllowed:false,
    dispatchAllowed:false
  });
}

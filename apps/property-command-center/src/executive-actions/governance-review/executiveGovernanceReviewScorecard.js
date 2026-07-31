import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceReviewScorecard({
  id,advisory,decisions,conflictResolutions,policyResults
}={}){
  const counts={APPROVED:0,REJECTED:0,DEFERRED:0};
  for(const decision of decisions)counts[decision.disposition]++;
  const blocked=policyResults.filter(item=>!item.passed).length;
  return freezeDeep({
    id:String(id),
    advisoryId:advisory.id,
    recommendationsReviewed:decisions.length,
    approved:counts.APPROVED,
    rejected:counts.REJECTED,
    deferred:counts.DEFERRED,
    conflictsResolved:conflictResolutions.length,
    blockedReviews:blocked,
    reviewComplete:decisions.length===advisory.recommendations.length&&blocked===0,
    humanReviewRequired:true,
    appendOnly:true,
    readOnly:true,
    advisoryOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}

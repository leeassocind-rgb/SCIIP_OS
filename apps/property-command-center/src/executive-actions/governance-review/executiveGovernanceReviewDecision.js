import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveGovernanceReviewDecision(input={}){
  if(!input.id)throw new Error('Review decision id is required');
  if(!input.recommendationId)throw new Error('Recommendation id is required');
  if(!input.actorId)throw new Error('Identified human actor is required');
  if(!input.reason)throw new Error('Decision reason is required');
  const disposition=normalize(input.disposition);
  if(!['APPROVED','REJECTED','DEFERRED'].includes(disposition)){
    throw new Error(`Unsupported disposition: ${disposition}`);
  }
  return freezeDeep({
    id:String(input.id),
    recommendationId:String(input.recommendationId),
    advisoryId:String(input.advisoryId||'UNKNOWN'),
    actorId:String(input.actorId),
    actorRole:String(input.actorRole||'EXECUTIVE_REVIEWER'),
    disposition,
    reason:String(input.reason),
    decidedAt:input.decidedAt||new Date().toISOString(),
    evidenceIds:uniq(input.evidenceIds),
    conflictIds:uniq(input.conflictIds),
    sourceSignalIds:uniq(input.sourceSignalIds),
    humanDecision:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

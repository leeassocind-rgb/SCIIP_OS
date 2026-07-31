import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveGovernanceApprovedDecision(input={}){
  if(!input.id)throw new Error('Approved decision id is required');
  if(!input.recommendationId)throw new Error('Recommendation id is required');
  if(input.decision?.disposition!=='APPROVED')throw new Error('Only APPROVED decisions may be bridged');
  if(input.status!=='RECORDED')throw new Error('Decision ledger status must be RECORDED');
  if(!input.policy?.passed)throw new Error('Review policy must have passed');
  if(!input.decision?.actorId)throw new Error('Human decision actor is required');
  return freezeDeep({
    id:String(input.id),
    recommendationId:String(input.recommendationId),
    advisoryId:String(input.advisoryId||input.decision.advisoryId||'UNKNOWN'),
    actorId:String(input.decision.actorId),
    actorRole:String(input.decision.actorRole||'EXECUTIVE_REVIEWER'),
    reason:String(input.decision.reason),
    decidedAt:input.decision.decidedAt,
    evidenceIds:uniq(input.decision.evidenceIds),
    sourceSignalIds:uniq(input.decision.sourceSignalIds),
    decisionLedgerSequence:Number(input.sequence)||null,
    humanApproved:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

import{freezeDeep,normalize,uniq}from'./_shared.js';

export function resolveExecutiveGovernanceConflict(input={}){
  if(!input.id)throw new Error('Conflict resolution id is required');
  if(!input.actorId)throw new Error('Conflict resolution actor is required');
  if(!input.reason)throw new Error('Conflict resolution reason is required');
  const resolution=normalize(input.resolution);
  if(!['SELECT_PRIMARY','MERGE','REJECT_ALL','DEFER_ALL'].includes(resolution)){
    throw new Error(`Unsupported conflict resolution: ${resolution}`);
  }
  const recommendationIds=uniq(input.recommendationIds);
  if(recommendationIds.length<2)throw new Error('At least two conflicting recommendations are required');
  return freezeDeep({
    id:String(input.id),
    conflictId:String(input.conflictId||input.id),
    recommendationIds,
    primaryRecommendationId:input.primaryRecommendationId||null,
    actorId:String(input.actorId),
    resolution,
    reason:String(input.reason),
    resolvedAt:input.resolvedAt||new Date().toISOString(),
    humanDecision:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

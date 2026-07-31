import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveGovernanceProposalReviewDecision(input={}){
  if(!input.id)throw new Error('Proposal review decision id is required');
  if(!input.proposalId)throw new Error('Proposal id is required');
  if(!input.actorId)throw new Error('Identified human reviewer is required');
  if(!input.reason)throw new Error('Review reason is required');
  const disposition=normalize(input.disposition);
  if(!['APPROVED','REJECTED','DEFERRED'].includes(disposition)){
    throw new Error(`Unsupported proposal disposition: ${disposition}`);
  }
  return freezeDeep({
    id:String(input.id),
    proposalId:String(input.proposalId),
    envelopeId:String(input.envelopeId||'UNKNOWN'),
    actorId:String(input.actorId),
    actorRole:String(input.actorRole||'ACTION_PROPOSAL_REVIEWER'),
    disposition,
    reason:String(input.reason),
    decidedAt:input.decidedAt||new Date().toISOString(),
    evidenceIds:uniq(input.evidenceIds),
    sourceSignalIds:uniq(input.sourceSignalIds),
    humanDecision:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

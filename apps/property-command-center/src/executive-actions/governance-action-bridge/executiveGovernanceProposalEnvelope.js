import{freezeDeep,uniq}from'./_shared.js';

export function createExecutiveGovernanceProposalEnvelope({id,proposal,policy}={}){
  if(!id)throw new Error('Proposal envelope id is required');
  if(!proposal?.id)throw new Error('Proposal is required');
  if(!policy?.passed)throw new Error('Proposal policy must pass');
  return freezeDeep({
    id:String(id),
    proposalId:proposal.id,
    proposal,
    policy,
    createdAt:new Date().toISOString(),
    targetCapability:'executive-action-orchestration',
    handoffStatus:'READY_FOR_GOVERNED_PROPOSAL_REVIEW',
    evidenceIds:uniq(proposal.evidenceIds),
    sourceSignalIds:uniq(proposal.sourceSignalIds),
    humanApprovalRequired:true,
    directDispatchAllowed:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false
  });
}

import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceProposalReviewLedger({maxEntries=100}={}){
  const entries=[];
  const byId=new Map();
  const byProposal=new Map();
  return Object.freeze({
    append(entry){
      if(!entry?.id)throw new Error('Proposal review ledger entry id is required');
      if(byId.has(entry.id))return{duplicate:true,entry:byId.get(entry.id)};
      if(byProposal.has(entry.proposalId)){
        return{duplicate:true,entry:byProposal.get(entry.proposalId)};
      }
      const frozen=freezeDeep({...entry,sequence:entries.length+1});
      entries.push(frozen);
      byId.set(frozen.id,frozen);
      byProposal.set(frozen.proposalId,frozen);
      while(entries.length>maxEntries){
        const removed=entries.shift();
        byId.delete(removed.id);
        byProposal.delete(removed.proposalId);
      }
      return{duplicate:false,entry:frozen};
    },
    get:id=>byId.get(id)||null,
    getByProposal:id=>byProposal.get(id)||null,
    list:()=>[...entries],
    getStatus:()=>freezeDeep({
      status:'OPERATIONAL',
      entries:entries.length,
      appendOnly:true,
      executionAuthorized:false,
      workflowMutationAllowed:false
    })
  });
}

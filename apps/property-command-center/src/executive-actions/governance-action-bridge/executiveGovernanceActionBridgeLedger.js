import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceActionBridgeLedger({maxEntries=100}={}){
  const entries=[];
  const byId=new Map();
  const byDecision=new Map();
  return Object.freeze({
    append(entry){
      if(!entry?.id)throw new Error('Bridge ledger entry id is required');
      if(byId.has(entry.id))return{duplicate:true,entry:byId.get(entry.id)};
      if(byDecision.has(entry.approvedDecisionId)){
        return{duplicate:true,entry:byDecision.get(entry.approvedDecisionId)};
      }
      const frozen=freezeDeep({...entry,sequence:entries.length+1});
      entries.push(frozen);
      byId.set(frozen.id,frozen);
      byDecision.set(frozen.approvedDecisionId,frozen);
      while(entries.length>maxEntries){
        const removed=entries.shift();
        byId.delete(removed.id);
        byDecision.delete(removed.approvedDecisionId);
      }
      return{duplicate:false,entry:frozen};
    },
    get:id=>byId.get(id)||null,
    getByDecision:id=>byDecision.get(id)||null,
    list:()=>[...entries],
    getStatus:()=>freezeDeep({
      status:'OPERATIONAL',
      entries:entries.length,
      appendOnly:true,
      directDispatchAllowed:false,
      workflowMutationAllowed:false
    })
  });
}

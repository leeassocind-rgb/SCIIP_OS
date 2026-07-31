import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceDecisionLedger({maxEntries=100}={}){
  const entries=[];
  const byId=new Map();
  const byRecommendation=new Map();
  return Object.freeze({
    append(entry){
      if(!entry?.id)throw new Error('Decision ledger entry id is required');
      if(byId.has(entry.id))return{duplicate:true,entry:byId.get(entry.id)};
      if(byRecommendation.has(entry.recommendationId)){
        return{duplicate:true,entry:byRecommendation.get(entry.recommendationId)};
      }
      const frozen=freezeDeep({...entry,sequence:entries.length+1});
      entries.push(frozen);
      byId.set(frozen.id,frozen);
      byRecommendation.set(frozen.recommendationId,frozen);
      while(entries.length>maxEntries){
        const removed=entries.shift();
        byId.delete(removed.id);
        byRecommendation.delete(removed.recommendationId);
      }
      return{duplicate:false,entry:frozen};
    },
    get:id=>byId.get(id)||null,
    getByRecommendation:id=>byRecommendation.get(id)||null,
    list:()=>[...entries],
    getStatus:()=>freezeDeep({
      status:'OPERATIONAL',
      entries:entries.length,
      appendOnly:true,
      workflowMutationAllowed:false
    })
  });
}

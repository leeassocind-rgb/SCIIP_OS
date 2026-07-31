import{freezeDeep}from'./_shared.js';

export function createExecutiveGovernanceRuntimeIntegrationLedger({maxEntries=100}={}){
  const entries=[];
  const byId=new Map();
  const bySubmission=new Map();
  return Object.freeze({
    append(entry){
      if(!entry?.id)throw new Error('Runtime integration ledger entry id is required');
      if(byId.has(entry.id))return{duplicate:true,entry:byId.get(entry.id)};
      if(bySubmission.has(entry.submissionId))return{duplicate:true,entry:bySubmission.get(entry.submissionId)};
      const frozen=freezeDeep({...entry,sequence:entries.length+1});
      entries.push(frozen);
      byId.set(frozen.id,frozen);
      bySubmission.set(frozen.submissionId,frozen);
      while(entries.length>maxEntries){
        const removed=entries.shift();
        byId.delete(removed.id);
        bySubmission.delete(removed.submissionId);
      }
      return{duplicate:false,entry:frozen};
    },
    get:id=>byId.get(id)||null,
    getBySubmission:id=>bySubmission.get(id)||null,
    list:()=>[...entries],
    getStatus:()=>freezeDeep({status:'OPERATIONAL',entries:entries.length,appendOnly:true})
  });
}

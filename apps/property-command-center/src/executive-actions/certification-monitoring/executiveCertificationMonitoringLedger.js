import{freezeDeep}from'./_shared.js';

export function createExecutiveCertificationMonitoringLedger({maxEntries=100}={}){
  const entries=[];
  const byId=new Map();
  return Object.freeze({
    append(entry){
      if(!entry?.id)throw new Error('Monitoring ledger entry id is required');
      if(byId.has(entry.id))return{duplicate:true,entry:byId.get(entry.id)};
      const frozen=freezeDeep({...entry,sequence:entries.length+1});
      entries.push(frozen);
      byId.set(frozen.id,frozen);
      while(entries.length>maxEntries){
        const removed=entries.shift();
        byId.delete(removed.id);
      }
      return{duplicate:false,entry:frozen};
    },
    get:id=>byId.get(id)||null,
    list:()=>[...entries],
    getStatus:()=>freezeDeep({status:'OPERATIONAL',entries:entries.length,appendOnly:true})
  });
}

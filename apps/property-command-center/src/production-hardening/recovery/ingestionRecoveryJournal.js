const freeze=value=>Object.freeze(value);
const clone=value=>JSON.parse(JSON.stringify(value));

export function createIngestionRecoveryJournal({maxEntries=1000}={}){
  const entries=[];
  const byId=new Map();
  const byOperation=new Map();

  const append=entry=>{
    if(!entry?.id)throw new Error('Recovery journal entry id is required');
    if(!entry?.operationId)throw new Error('Recovery operation id is required');
    if(byId.has(entry.id))return freeze({duplicate:true,entry:byId.get(entry.id)});
    const frozen=freeze({...clone(entry),sequence:entries.length+1});
    entries.push(frozen);
    byId.set(frozen.id,frozen);
    if(!byOperation.has(frozen.operationId))byOperation.set(frozen.operationId,[]);
    byOperation.get(frozen.operationId).push(frozen);
    while(entries.length>maxEntries){
      const removed=entries.shift();
      byId.delete(removed.id);
      const list=byOperation.get(removed.operationId)||[];
      byOperation.set(removed.operationId,list.filter(item=>item.id!==removed.id));
    }
    return freeze({duplicate:false,entry:frozen});
  };

  return Object.freeze({
    append,
    get:id=>byId.get(id)||null,
    list:()=>Object.freeze([...entries]),
    listByOperation:operationId=>Object.freeze([...(byOperation.get(operationId)||[])]),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      entries:entries.length,
      operations:[...byOperation.keys()].length,
      appendOnly:true,
      destructiveMutationAllowed:false
    })
  });
}

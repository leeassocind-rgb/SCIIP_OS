const freeze=value=>Object.freeze(value);
const clone=value=>JSON.parse(JSON.stringify(value));

export function createOfflineIngestionQueue({
  storage,
  queueKey='sciip.production.offline.ingestion.queue.v1',
  checkpointKey='sciip.production.offline.ingestion.checkpoints.v1',
  maxItems=1000
}={}){
  if(!storage?.get||!storage?.set)throw new Error('Durable storage adapter is required');
  const readQueue=()=>Array.isArray(storage.get(queueKey))?storage.get(queueKey):[];
  const readCheckpoints=()=>storage.get(checkpointKey)||{};

  const persistQueue=queue=>storage.set(queueKey,queue);
  const persistCheckpoints=checkpoints=>storage.set(checkpointKey,checkpoints);

  const enqueue=item=>{
    if(!item?.id)throw new Error('Offline queue item id is required');
    const queue=readQueue();
    const existing=queue.find(entry=>entry.id===item.id);
    if(existing)return freeze({duplicate:true,item:freeze(existing),queueLength:queue.length});
    const next=freeze({
      ...clone(item),
      status:'QUEUED_OFFLINE',
      queuedAt:item.queuedAt||new Date().toISOString(),
      attempts:Number(item.attempts||0)
    });
    const updated=[...queue,next].slice(-maxItems);
    persistQueue(updated);
    return freeze({duplicate:false,item:next,queueLength:updated.length});
  };

  const checkpoint=({stream,offset,operationId,updatedAt}={})=>{
    if(!stream)throw new Error('Offline checkpoint stream is required');
    const checkpoints=readCheckpoints();
    const prior=checkpoints[stream];
    if(prior&&Number(offset)<Number(prior.offset)){
      return freeze({...prior,ignored:true});
    }
    const next=freeze({
      stream,
      operationId:operationId||stream,
      offset:Number(offset||0),
      updatedAt:updatedAt||new Date().toISOString(),
      durable:true
    });
    persistCheckpoints({...checkpoints,[stream]:next});
    return next;
  };

  const flush=async({online=true,send}={})=>{
    if(!online)return freeze({
      status:'OFFLINE',
      sent:0,
      failed:0,
      retained:readQueue().length
    });
    if(typeof send!=='function')throw new Error('Offline queue sender is required');

    const queue=readQueue();
    const retained=[];
    const results=[];
    let sent=0,failed=0;
    for(const item of queue){
      try{
        const response=await send(freeze({...item,attempts:Number(item.attempts||0)+1}));
        results.push(freeze({id:item.id,status:'SENT',response}));
        sent++;
      }catch(error){
        retained.push(freeze({
          ...item,
          attempts:Number(item.attempts||0)+1,
          lastError:error?.message||String(error),
          status:'RETRY_PENDING'
        }));
        results.push(freeze({id:item.id,status:'FAILED',error:error?.message||String(error)}));
        failed++;
      }
    }
    persistQueue(retained);
    return freeze({
      status:failed?'PARTIAL':'FLUSHED',
      sent,
      failed,
      retained:retained.length,
      results:freeze(results)
    });
  };

  return Object.freeze({
    enqueue,
    checkpoint,
    flush,
    list:()=>Object.freeze(readQueue().map(item=>freeze(item))),
    getCheckpoint:stream=>{
      const value=readCheckpoints()[stream];
      return value?freeze(value):null;
    },
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      queued:readQueue().length,
      checkpoints:Object.keys(readCheckpoints()).length,
      durable:true,
      duplicateSafe:true,
      monotonicCheckpoints:true,
      sourceMutationAllowed:false
    })
  });
}

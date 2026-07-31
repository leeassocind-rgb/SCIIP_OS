import { createOfflineIngestionQueue } from './offlineIngestionQueue.js';

const freeze=value=>Object.freeze(value);

export function createOfflineResilienceManager({
  storage,
  connectivity=()=>true,
  send
}={}){
  const queue=createOfflineIngestionQueue({storage});
  let transitions=0;
  let lastOnline=Boolean(connectivity());

  const submit=async item=>{
    const online=Boolean(connectivity());
    if(online!==lastOnline){transitions++;lastOnline=online}
    if(!online){
      return freeze({
        mode:'OFFLINE',
        queued:queue.enqueue(item),
        sourceMutationAllowed:false
      });
    }
    try{
      const response=await send(item);
      return freeze({
        mode:'ONLINE',
        sent:true,
        response,
        sourceMutationAllowed:false
      });
    }catch(error){
      return freeze({
        mode:'DEGRADED',
        sent:false,
        queued:queue.enqueue({...item,lastError:error?.message||String(error)}),
        sourceMutationAllowed:false
      });
    }
  };

  const synchronize=async()=>{
    const online=Boolean(connectivity());
    if(online!==lastOnline){transitions++;lastOnline=online}
    return queue.flush({online,send});
  };

  return Object.freeze({
    submit,
    synchronize,
    checkpoint:queue.checkpoint,
    getCheckpoint:queue.getCheckpoint,
    listQueued:queue.list,
    snapshot:()=>freeze({
      status:lastOnline?'ONLINE':'OFFLINE',
      transitions,
      queued:queue.snapshot().queued,
      checkpoints:queue.snapshot().checkpoints,
      durable:true,
      duplicateSafe:true,
      offlineResilient:true,
      sourceMutationAllowed:false
    })
  });
}

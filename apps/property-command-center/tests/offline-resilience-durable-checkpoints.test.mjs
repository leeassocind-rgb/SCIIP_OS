import assert from'node:assert/strict';
import {
  createMemoryDurableStorage,
  createOfflineIngestionQueue,
  createOfflineResilienceManager
} from '../src/production-hardening/offline/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};

const storage=createMemoryDurableStorage();
t(storage.snapshot().durable);
const queue=createOfflineIngestionQueue({storage,maxItems:10});
t(queue.snapshot().status==='OPERATIONAL');
t(queue.snapshot().durable);
t(queue.snapshot().duplicateSafe);
t(queue.snapshot().monotonicCheckpoints);

const first=queue.enqueue({id:'Q-1',operationId:'ING-46-1',payload:{chunk:1}});
t(!first.duplicate);
t(first.queueLength===1);
const duplicate=queue.enqueue({id:'Q-1',operationId:'ING-46-1',payload:{chunk:1}});
t(duplicate.duplicate);
t(queue.list().length===1);

const cp1=queue.checkpoint({stream:'supersheet:46',operationId:'ING-46-1',offset:5,updatedAt:'2026-07-31T21:00:00Z'});
t(cp1.offset===5);
const cpOld=queue.checkpoint({stream:'supersheet:46',operationId:'ING-46-1',offset:4});
t(cpOld.offset===5);
t(cpOld.ignored);
const cp2=queue.checkpoint({stream:'supersheet:46',operationId:'ING-46-1',offset:8});
t(cp2.offset===8);
t(queue.getCheckpoint('supersheet:46').offset===8);

const offline=await queue.flush({online:false,send:async()=>true});
t(offline.status==='OFFLINE');
t(offline.retained===1);

const partialQueue=createOfflineIngestionQueue({storage:createMemoryDurableStorage()});
partialQueue.enqueue({id:'Q-2'});
partialQueue.enqueue({id:'Q-3'});
const partial=await partialQueue.flush({
  online:true,
  send:async item=>{
    if(item.id==='Q-3')throw new Error('Network failure');
    return{ok:true};
  }
});
t(partial.status==='PARTIAL');
t(partial.sent===1);
t(partial.failed===1);
t(partial.retained===1);
t(partialQueue.list()[0].status==='RETRY_PENDING');
t(partialQueue.list()[0].attempts===1);

let online=false;
const delivered=[];
const manager=createOfflineResilienceManager({
  storage:createMemoryDurableStorage(),
  connectivity:()=>online,
  send:async item=>{delivered.push(item.id);return{ok:true}}
});
const queued=await manager.submit({id:'M-1',payload:{rows:100}});
t(queued.mode==='OFFLINE');
t(manager.snapshot().queued===1);
t(manager.snapshot().offlineResilient);

online=true;
const sync=await manager.synchronize();
t(sync.status==='FLUSHED');
t(sync.sent===1);
t(sync.retained===0);
t(delivered[0]==='M-1');
t(manager.snapshot().status==='ONLINE');
t(manager.snapshot().transitions===1);

const direct=await manager.submit({id:'M-2'});
t(direct.mode==='ONLINE');
t(direct.sent);
t(delivered.includes('M-2'));
t(!manager.snapshot().sourceMutationAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE4_SPRINT46_OFFLINE_RESILIENCE_DURABLE_CHECKPOINTS',
  status:'PASSED',
  testsRun:tests,
  result:{
    duplicateSafe:true,
    monotonicCheckpoints:true,
    offlineQueue:true,
    retryPending:true,
    synchronization:true,
    connectivityTransitions:manager.snapshot().transitions,
    durable:true,
    offlineResilient:true,
    sourceMutationAllowed:false,
    resilienceStatus:'CERTIFIED'
  }
},null,2));

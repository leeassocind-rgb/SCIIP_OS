import assert from 'node:assert/strict';
import {
  createMemoryEnterpriseStateStorage,
  createGlobalStateSynchronizer
} from '../src/enterprise-runtime/state-sync/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const storage=createMemoryEnterpriseStateStorage();
const sync=createGlobalStateSynchronizer({storage});

sync.applyUpdate({
  workspace:'GIS Intelligence',
  clock:1,
  patch:{selectedPropertyId:'P1',activeQuery:'Rialto'}
});
sync.applyUpdate({
  workspace:'Property Digital Twin',
  clock:1,
  patch:{selectedEntityId:'ENTITY-P1'}
});
sync.applyUpdate({
  workspace:'GIS Intelligence',
  clock:2,
  patch:{selectedPropertyId:'P2'},
  online:false
});

t(sync.getSnapshot().selectedPropertyId==='P1');
t(sync.snapshot().queuedOfflineUpdates===1);
sync.flushOfflineQueue();
t(sync.getSnapshot().selectedPropertyId==='P2');
t(sync.getSnapshot().selectedEntityId==='ENTITY-P1');
t(sync.getSnapshot().vector['GIS Intelligence']===2);
t(sync.snapshot().persistent);
t(sync.snapshot().deterministicReconciliation);
t(sync.snapshot().offlineRecovery);
t(!sync.snapshot().productionExecutionAuthorized);

const recovered=createGlobalStateSynchronizer({storage});
t(recovered.getSnapshot().selectedPropertyId==='P2');
t(recovered.getSnapshot().revision===4);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT113_GLOBAL_STATE_SYNCHRONIZATION',
  status:'PASSED',
  testsRun:tests,
  result:sync.snapshot()
},null,2));

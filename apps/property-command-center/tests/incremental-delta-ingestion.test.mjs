import assert from'node:assert/strict';
import{buildIncrementalDeltaPlan}from'../src/phase18-ingestion/delta/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildIncrementalDeltaPlan({
 previous:[{id:'1',value:'A'},{id:'2',value:'B'},{id:'3',value:'C'}],
 current:[{id:'1',value:'A'},{id:'2',value:'B2'},{id:'4',value:'D'}]
});
t(r.counts.inserts===1);t(r.counts.updates===1);t(r.counts.unchanged===1);t(r.counts.deletes===1);t(r.idempotent);t(!r.deleteExecutionAllowed);t(!r.autonomousCommitAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT291_INCREMENTAL_DELTA_INGESTION',status:'PASSED',testsRun:n,result:r},null,2));

import assert from'node:assert/strict';
import{evaluateLargeScaleIngestionRehearsal}from'../src/phase18-ingestion/rehearsal/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateLargeScaleIngestionRehearsal({
 batches:[
  {batchId:'B1',rows:30000,durationMs:120000,errorRows:30,maxQueueDepth:80},
  {batchId:'B2',rows:10000,durationMs:200000,errorRows:300,maxQueueDepth:120}
 ]
});
t(r.total===2);t(r.passed===1);t(r.failed===1);t(r.totalRows===40000);t(r.batches[0].rowsPerSecond===250);t(!r.rehearsalCertified);t(!r.productionWritesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT292_LARGE_SCALE_INGESTION_REHEARSAL',status:'PASSED',testsRun:n,result:r},null,2));

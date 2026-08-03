import assert from'node:assert/strict';
import{createMemoryActivationStorage,createProductionActivationStateRuntime}from'../src/production-activation/runtime/index.js';
import{createBatchSuperSheetIntake}from'../src/production-activation/batch-intake/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const runtime=createProductionActivationStateRuntime({storage:createMemoryActivationStorage()});
const intake=createBatchSuperSheetIntake({activationRuntime:runtime,maxBatchSize:30});
const staged=intake.stage({batchId:'B-001',files:[
 {fileName:'A.csv',rows:100,checksum:'x1'},
 {fileName:'B.csv',rows:120,checksum:'x2'},
 {fileName:'A-copy.csv',rows:100,checksum:'x1'}
]});
t(staged.status==='STAGED');t(staged.fileCount===3);t(staged.totalRows===320);t(staged.duplicates===1);t(staged.queued===2);t(!staged.productionWritesEnabled);t(!staged.sourceMutationAllowed);
const processing=intake.begin({batchId:'B-001'});
t(processing.status==='PROCESSING');t(processing.items.filter(i=>i.status==='READY').length===2);
const complete=intake.complete({batchId:'B-001',results:[
 {batchItemId:'BATCH-001',status:'COMPLETED',accepted:99,warnings:1,rejected:0},
 {batchItemId:'BATCH-002',status:'COMPLETED',accepted:118,warnings:1,rejected:1}
]});
t(complete.status==='COMPLETED');t(complete.completed===2);t(complete.failed===0);t(complete.items[0].accepted===99);t(intake.list().length===1);
const state=runtime.getSnapshot();t(state.batchIntake.batchCount===1);t(state.batchIntake.status==='COMPLETED');
console.log(JSON.stringify({framework:'SCIIP_PHASE5_SPRINT67_BATCH_SUPERSHEET_INTAKE',status:'PASSED',testsRun:n,result:{batchId:complete.batchId,fileCount:complete.fileCount,totalRows:complete.totalRows,duplicates:complete.duplicates,completed:complete.completed,productionWritesEnabled:false}},null,2));

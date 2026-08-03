import assert from'node:assert/strict';
import{activateProductionCorpus}from'../src/phase18-corpus/activation/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=activateProductionCorpus({datasets:[
 {datasetId:'D1',name:'Properties',rowCount:1000,certified:true},
 {datasetId:'D2',name:'Events',rowCount:0,certified:true}
]});
t(r.total===2);t(r.ready===1);t(r.blocked===1);t(r.totalRows===1000);t(r.activationGoverned);t(!r.autonomousActivationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT295_PRODUCTION_CORPUS_ACTIVATION',status:'PASSED',testsRun:n,result:r},null,2));

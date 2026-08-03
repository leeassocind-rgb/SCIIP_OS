import assert from'node:assert/strict';
import{validateCrossSheetReferentialIntegrity}from'../src/phase18-ingestion/integrity/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=validateCrossSheetReferentialIntegrity({
 entities:{
  Property:[{id:'P1'}],
  Company:[{id:'C1'}]
 },
 relationships:[
  {relationshipId:'R1',fromType:'Property',fromId:'P1',toType:'Company',toId:'C1'},
  {relationshipId:'R2',fromType:'Property',fromId:'P2',toType:'Company',toId:'C1'}
 ]
});
t(r.total===2);t(r.valid===1);t(r.orphaned===1);t(r.relationships[1].status==='ORPHANED');t(r.referentialIntegrityEnforced);t(!r.orphanWritesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT290_CROSS_SHEET_REFERENTIAL_INTEGRITY',status:'PASSED',testsRun:n,result:r},null,2));

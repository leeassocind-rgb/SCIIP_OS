import assert from'node:assert/strict';
import{mapOutcomesToImprovements}from'../src/phase18-outcomes/improvement/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=mapOutcomesToImprovements({
 outcomes:[{executionId:'E1'}],
 feedback:[{feedbackId:'F1'}],
 improvements:[
  {improvementId:'I1',executionIds:['E1'],feedbackIds:['F1']},
  {improvementId:'I2',executionIds:['E9'],feedbackIds:[]}
 ]
});
t(r.total===2);t(r.evidenceReady===1);t(r.improvements[0].evidenceCount===2);
t(r.improvements[1].status==='INSUFFICIENT_EVIDENCE');t(r.evidenceRequired);
t(r.humanReviewRequired);t(!r.autonomousProcessChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT315_OUTCOME_IMPROVEMENT_MAPPING',status:'PASSED',testsRun:n,result:r},null,2));

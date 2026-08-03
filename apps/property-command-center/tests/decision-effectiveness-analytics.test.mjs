import assert from'node:assert/strict';
import{evaluateDecisionEffectiveness}from'../src/phase18-executive-intelligence/effectiveness/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateDecisionEffectiveness({
 decisions:[{decisionId:'D1'},{decisionId:'D2'},{decisionId:'D3'}],
 outcomes:[
  {decisionId:'D1',status:'SUCCESS',valueRealized:90,cycleDays:10},
  {decisionId:'D2',status:'FAILED',valueRealized:20,cycleDays:30}
 ]
});
t(r.total===3);t(r.effective===1);t(r.reviewRequired===1);t(r.pending===1);
t(r.decisions[0].status==='EFFECTIVE');t(r.evidenceBacked);
t(!r.autonomousDecisionChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT321_DECISION_EFFECTIVENESS_ANALYTICS',status:'PASSED',testsRun:n,result:r},null,2));

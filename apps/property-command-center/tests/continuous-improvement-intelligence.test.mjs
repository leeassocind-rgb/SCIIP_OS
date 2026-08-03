import assert from'node:assert/strict';
import{evaluateImprovementBacklog}from'../src/enterprise-operating-model/improvement/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateImprovementBacklog({
 evidence:[{evidenceId:'E1'}],
 items:[
  {improvementId:'I1',impactScore:90,effortScore:20,riskScore:10,evidenceIds:['E1']},
  {improvementId:'I2',impactScore:95,effortScore:10,riskScore:5,evidenceIds:['E2']}
 ]
});
t(r.total===2);t(r.supported===1);t(r.topImprovement.improvementId==='I1');t(r.evidenceRequired);t(r.humanReviewRequired);t(!r.autonomousProcessChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT278_CONTINUOUS_IMPROVEMENT_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));

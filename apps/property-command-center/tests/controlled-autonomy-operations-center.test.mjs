import assert from'node:assert/strict';import fs from'node:fs';
import{deriveClosedLoopLearning}from'../src/controlled-autonomy/learning/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const learning=deriveClosedLoopLearning({verifications:[
 {runId:'R1',status:'VERIFIED',rollbackRecommended:false},
 {runId:'R2',status:'VERIFICATION_FAILED',rollbackRecommended:true}
]});
t(learning.total===2);t(learning.verified===1);t(learning.failed===1);
t(!learning.policyChangesAutoApplied);t(learning.humanReviewRequired);t(!learning.productionExecutionAuthorized);
const source=fs.readFileSync('src/components/ControlledAutonomyOperationsCenter.jsx','utf8');
t(source.includes('Controlled Autonomy Operations Center'));t(source.includes('PRODUCTION BLOCKED'));
console.log(JSON.stringify({framework:'SCIIP_PHASE10_SPRINT110_CONTROLLED_AUTONOMY_OPERATIONS_CENTER',status:'PASSED',testsRun:n,result:learning},null,2));

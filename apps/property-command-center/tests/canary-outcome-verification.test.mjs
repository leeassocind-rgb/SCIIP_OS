import assert from'node:assert/strict';
import{verifyCanaryOutcome}from'../src/controlled-autonomy/verification/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const passed=verifyCanaryOutcome({run:{runId:'R1'},expected:{status:'DRAFTED',count:1},actual:{status:'DRAFTED',count:1}});
t(passed.status==='VERIFIED');t(passed.promotionEligible);t(!passed.rollbackRecommended);t(!passed.productionPromotionAuthorized);
const failed=verifyCanaryOutcome({run:{runId:'R2'},expected:{count:1},actual:{count:2}});
t(failed.status==='VERIFICATION_FAILED');t(failed.rollbackRecommended);t(!failed.promotionEligible);
console.log(JSON.stringify({framework:'SCIIP_PHASE10_SPRINT109_CANARY_OUTCOME_VERIFICATION',status:'PASSED',testsRun:n,result:{passed,failed}},null,2));

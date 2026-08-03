import assert from'node:assert/strict';import{verifyGroundedResponse}from'../src/enterprise-ai/assurance/grounding/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=verifyGroundedResponse({evidence:[{evidenceId:'E1'},{evidenceId:'E2'}],claims:[{claimId:'C1',evidenceIds:['E1']},{claimId:'C2',evidenceIds:['E2']}]});
t(r.claimCount===2);t(r.supportedClaims===2);t(r.unsupportedClaims===0);t(r.grounded);t(!r.unsupportedClaimsAllowed);t(r.citationsRequired);t(!r.productionExecutionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE16_SPRINT195_GROUNDING_AND_HALLUCINATION_CONTROLS',status:'PASSED',testsRun:n,result:r},null,2));

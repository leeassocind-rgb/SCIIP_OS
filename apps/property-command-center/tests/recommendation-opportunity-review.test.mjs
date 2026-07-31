import assert from'node:assert/strict';import{createIntelligenceReviewViewModel}from'../src/enterprise-intelligence/review/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const view=createIntelligenceReviewViewModel({recommendations:[{recommendationId:'R1',subjectId:'P1',confidence:.8,status:'RECOMMENDED',action:'REVIEW',evidence:[{}]}],opportunities:[{opportunityId:'O1',propertyId:'P2',score:90,status:'DETECTED',recommendedAction:'QUALIFY',signals:[{},{}]}]});
t(view.total===2);t(view.reviewReady===2);t(view.evidenceComplete===2);t(view.items[0].id==='O1');t(view.approvalRequired);t(!view.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE6_SPRINT84_RECOMMENDATION_OPPORTUNITY_REVIEW',status:'PASSED',testsRun:n,result:view},null,2));

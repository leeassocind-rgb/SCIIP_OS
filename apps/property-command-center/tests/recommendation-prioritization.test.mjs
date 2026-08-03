import assert from'node:assert/strict';
import{prioritizeRecommendations}from'../src/phase18-decision/recommendations/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=prioritizeRecommendations({recommendations:[
 {recommendationId:'R1',valueScore:90,urgencyScore:80,confidence:.9,riskScore:20},
 {recommendationId:'R2',valueScore:95,urgencyScore:90,confidence:.5,riskScore:10}
]});
t(r.total===2);t(r.reviewReady===1);t(r.topRecommendation.recommendationId==='R1');t(r.assumptionsVisible);t(r.executiveApprovalRequired);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT303_RECOMMENDATION_PRIORITIZATION',status:'PASSED',testsRun:n,result:r},null,2));

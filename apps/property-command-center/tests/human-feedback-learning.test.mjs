import assert from'node:assert/strict';import{processHumanFeedback}from'../src/enterprise-ai/lifecycle/feedback/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=processHumanFeedback({feedback:[
{subjectId:'A1',status:'ACCEPTED',reviewer:'U1'},
{subjectId:'A2',status:'REJECTED',reviewer:'U2',correction:'Use verified comp'}
]});
t(r.total===2);t(r.accepted===1);t(r.rejected===1);t(r.corrections===1);t(r.learningSignals.length===1);t(r.humanReviewed);t(r.trainingApprovalRequired);t(!r.autoTrain);t(r.permanentHistory);
console.log(JSON.stringify({framework:'SCIIP_PHASE16_SPRINT202_HUMAN_FEEDBACK_LEARNING',status:'PASSED',testsRun:n,result:r},null,2));

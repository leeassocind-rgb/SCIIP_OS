import assert from'node:assert/strict';
import{evaluateBrokerFeedback}from'../src/phase18-outcomes/feedback/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateBrokerFeedback({feedback:[
 {feedbackId:'F1',score:5,category:'Workflow',comment:'Fast and clear'},
 {feedbackId:'F2',score:2,category:'Search',comment:'Needs better filtering'},
 {feedbackId:'F3',score:3}
]});
t(r.total===3);t(r.actionable===2);t(r.positive===1);t(r.negative===1);
t(r.feedback[2].status==='INCOMPLETE');t(r.brokerControlled);
t(!r.autonomousFeedbackRewritingAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT314_BROKER_FEEDBACK_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));

import assert from'node:assert/strict';
import{certifyOutcomeFeedbackImprovement}from'../src/phase18-outcomes/certification/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=certifyOutcomeFeedbackImprovement({
 outcomes:{permanentOutcomeHistory:true,autonomousOutcomeChangesAllowed:false},
 feedback:{brokerControlled:true,autonomousFeedbackRewritingAllowed:false},
 improvements:{evidenceRequired:true,humanReviewRequired:true},
 learning:{approvalRequired:true,rollbackRequired:true},
 command:{outcomeImprovementReady:true,humanReviewRequired:true},
 userValidation:{navigation:true,outcomesVisible:true,controlsVisible:true},
 governance:{evidenceRequired:true,approvalRequired:true,permanentHistory:true},
 safety:{
  autonomousLearningAllowed:false,
  autonomousProcessChangesAllowed:false,
  autonomousOutcomeChangesAllowed:false
 }
});
t(r.status==='CERTIFIED');t(r.checksRun===8);t(r.checksPassed===8);t(r.checksFailed===0);
t(r.outcomeFeedbackImprovementReady);t(r.outcomesCertified);t(r.feedbackCertified);
t(r.improvementsCertified);t(r.learningCertified);t(r.commandCertified);
t(!r.autonomousLearningAllowed);t(!r.autonomousProcessChangesAllowed);
t(!r.autonomousOutcomeChangesAllowed);

console.log(JSON.stringify({
 framework:'SCIIP_PHASE18_SPRINT318_OUTCOME_FEEDBACK_IMPROVEMENT_CERTIFICATION',
 status:'PASSED',
 testsRun:n,
 result:r
},null,2));

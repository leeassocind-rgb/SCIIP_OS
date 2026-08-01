import assert from'node:assert/strict';
import{certifyPilotImprovementIntelligence}from'../src/pilot-operations/improvement-certification/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=certifyPilotImprovementIntelligence({
  feedback:{evidenceBacked:true,humanReviewRequired:true},
  adoption:{adoptionMeasured:true},
  workflowAnalytics:{workflowCompletionMeasured:true},
  issueTriage:{triageActive:true,productionImpact:false},
  userValidation:{navigation:true,feedbackVisible:true,adoptionVisible:true},
  governance:{approvalRequired:true,changesAutoApplied:false,productionExecutionAuthorized:false}
});

t(result.status==='CERTIFIED');
t(result.checksRun===7);
t(result.checksPassed===7);
t(result.checksFailed===0);
t(result.feedbackIntelligenceCertified);
t(result.adoptionAnalyticsCertified);
t(result.workflowAnalyticsCertified);
t(result.governedImprovementReady);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT135_PILOT_IMPROVEMENT_CERTIFICATION',
  status:'PASSED',testsRun:n,result
},null,2));

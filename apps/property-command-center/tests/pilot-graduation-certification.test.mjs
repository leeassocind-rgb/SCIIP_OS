import assert from'node:assert/strict';
import{certifyPilotGraduation}from'../src/pilot-operations/graduation-certification/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=certifyPilotGraduation({
  controlledOperations:{certified:true},
  feedbackIntelligence:{certified:true},
  adoptionAnalytics:{certified:true},
  improvementProposals:{approvalRequired:true,changesAutoApplied:false},
  releaseCandidate:{
    status:'RELEASE_CANDIDATE',pilotDeploymentEligible:true,
    productionDeploymentAuthorized:false
  },
  userValidation:{
    navigation:true,releaseGatesVisible:true,rollbackVisible:true
  },
  governance:{productionExecutionAuthorized:false},
  recovery:{rollbackReady:true,restartRecovery:true}
});
t(result.status==='CERTIFIED');
t(result.checksRun===8);
t(result.checksPassed===8);
t(result.checksFailed===0);
t(result.pilotGraduationReady);
t(result.releaseCandidateCertified);
t(result.controlledDeploymentReady);
t(!result.productionDeploymentAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT138_PILOT_GRADUATION_CERTIFICATION',
  status:'PASSED',testsRun:n,result
},null,2));

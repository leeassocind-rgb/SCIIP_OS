import assert from'node:assert/strict';
import{certifyGovernedProductionActivation}from'../src/production-activation/certification/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=certifyGovernedProductionActivation({
  deploymentRuntime:{controlled:true,productionDeploymentAuthorized:false},
  observability:{traceable:true,auditable:true,status:'READY',blockerCount:0,productionDeploymentAuthorized:false},
  userValidation:{navigation:true,readinessVisible:true,controlsVisible:true},
  recovery:{rollbackReady:true,restartRecovery:true,offlineRecovery:true},
  governance:{approvalRequired:true,evidenceRequired:true,changesAutoApplied:false,productionDeploymentAuthorized:false},
  releaseCandidate:{status:'RELEASE_CANDIDATE'}
});
t(result.status==='CERTIFIED');
t(result.checksRun===8);
t(result.checksPassed===8);
t(result.checksFailed===0);
t(result.controlledActivationReady);
t(result.observabilityCertified);
t(result.recoveryCertified);
t(result.releaseCandidateReady);
t(!result.productionDeploymentAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_SPRINT141_GOVERNED_PRODUCTION_ACTIVATION_CERTIFICATION',
  status:'PASSED',testsRun:n,result
},null,2));

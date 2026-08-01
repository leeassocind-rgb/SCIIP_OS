import assert from'node:assert/strict';
import{createControlledDeploymentRuntime}from'../src/production-activation/deployment/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const runtime=createControlledDeploymentRuntime();
const result=runtime.deploy({
  releaseCandidate:{status:'RELEASE_CANDIDATE',releaseCandidateId:'SCIIP-RC-13.0-rc1'},
  approval:{status:'APPROVED',reviewer:'ADMIN-1'},
  environment:'PILOT',
  rollbackPlan:{ready:true,rollbackPlanId:'RB-1'}
});
t(result.status==='DEPLOYED');
t(result.deployment.environment==='PILOT');
t(result.deployment.status==='ACTIVE');
t(result.deployment.approvedBy==='ADMIN-1');
t(runtime.snapshot().activeDeployments===1);
t(runtime.snapshot().controlled);
t(!runtime.snapshot().productionDeploymentAuthorized);
const stopped=runtime.stop({deploymentId:result.deployment.deploymentId,reason:'Pilot complete',approvedBy:'ADMIN-1'});
t(stopped.status==='STOPPED');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_SPRINT139_CONTROLLED_DEPLOYMENT_RUNTIME',
  status:'PASSED',testsRun:n,result:runtime.snapshot()
},null,2));

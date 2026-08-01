import assert from'node:assert/strict';
import{createProductionLaunchAuthorization}from'../src/production-activation/launch-authorization/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const now=Date.now();
const result=createProductionLaunchAuthorization({
  approvalBoard:{quorumReached:true},
  releaseCandidate:{status:'RELEASE_CANDIDATE',releaseCandidateId:'SCIIP-RC-13.0-rc1'},
  goLivePlan:{status:'READY_FOR_CONTROLLED_START'},
  observability:{status:'READY',blockerCount:0},
  recovery:{rollbackReady:true,restartRecovery:true},
  authorizationWindow:{
    startsAt:new Date(now-60000).toISOString(),
    expiresAt:new Date(now+60000).toISOString()
  }
});
t(result.checksRun===6);
t(result.checksPassed===6);
t(result.checksFailed===0);
t(result.windowValid);
t(result.windowOpen);
t(result.status==='READY_FOR_REHEARSAL');
t(result.rehearsalAuthorized);
t(!result.productionTrafficAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_SPRINT145_PRODUCTION_LAUNCH_AUTHORIZATION_CONTROLS',
  status:'PASSED',testsRun:n,result
},null,2));

import assert from'node:assert/strict';import{planGovernedRecovery}from'../src/production-operations/recovery/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=planGovernedRecovery({incident:{incidentId:'INC-1'},approval:{status:'APPROVED'},recoveryActions:[
 {actionId:'A1',type:'ROLLBACK'},{actionId:'A2',type:'REPLAY'}]});
t(r.incidentId==='INC-1');t(r.approvalStatus==='APPROVED');t(r.actions.length===2);t(r.actions.every(a=>a.status==='READY'));t(r.rollbackReady);t(r.replayReady);t(r.status==='READY_FOR_MANUAL_EXECUTION');t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT159_GOVERNED_RECOVERY_ORCHESTRATION',status:'PASSED',testsRun:n,result:r},null,2));

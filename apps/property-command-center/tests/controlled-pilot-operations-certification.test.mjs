import assert from'node:assert/strict';
import{certifyControlledPilotOperations}from'../src/pilot-operations/certification/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=certifyControlledPilotOperations({
  runtime:{persistent:true,governed:true,productionExecutionAuthorized:false},
  telemetry:{telemetryActive:true},
  triage:{triageActive:true,productionImpact:false},
  userValidation:{navigation:true,telemetryVisible:true,shutdownVisible:true},
  dataGovernance:{evidenceRequired:true,rejectedRecordsVisible:true,productionExecutionAuthorized:false},
  recovery:{restartRecovery:true,offlineRecovery:true},
  shutdownControl:{manualStop:true,approvalRequired:true,productionExecutionAuthorized:false}
});
t(result.status==='CERTIFIED');
t(result.checksRun===8);
t(result.checksPassed===8);
t(result.checksFailed===0);
t(result.controlledPilotOperational);
t(result.telemetryCertified);
t(result.triageCertified);
t(result.shutdownReady);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT132_CONTROLLED_PILOT_OPERATIONS_CERTIFICATION',
  status:'PASSED',testsRun:n,result
},null,2));

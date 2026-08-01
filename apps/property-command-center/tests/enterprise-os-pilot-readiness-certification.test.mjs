import assert from'node:assert/strict';
import{certifyEnterpriseOSPilotReadiness}from'../src/enterprise-os/pilot-certification/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=certifyEnterpriseOSPilotReadiness({
  activation:{status:'ACTIVATED',governed:true,productionExecutionAuthorized:false},
  runtime:{persistent:true,synchronized:true,enterpriseDigitalTwin:true,productionExecutionAuthorized:false},
  missionControl:{liveData:true,reactive:true,productionExecutionAuthorized:false},
  operationalUX:{responsive:true,accessible:true,keyboardNavigable:true,productionExecutionAuthorized:false},
  userValidation:{navigation:true,governanceVisible:true,freshnessVisible:true},
  recovery:{restartRecovery:true,offlineRecovery:true,replayReady:true},
  governance:{evidenceRequired:true,approvalRequired:true,policyChangesAutoApplied:false,productionExecutionAuthorized:false}
});
t(result.status==='CERTIFIED');
t(result.checksRun===8);
t(result.checksPassed===8);
t(result.checksFailed===0);
t(result.pilotReady);
t(result.superSheetActivated);
t(result.liveMissionControl);
t(result.operationalUXCertified);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_SPRINT129_ENTERPRISE_OS_PILOT_READINESS_CERTIFICATION',
  status:'PASSED',testsRun:n,result
},null,2));

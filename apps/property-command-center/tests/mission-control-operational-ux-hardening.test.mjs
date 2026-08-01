import assert from'node:assert/strict';
import fs from'node:fs';
import{createMissionControlOperationalUX}from'../src/enterprise-os/mission-control/operationalUXIndex.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const ux=createMissionControlOperationalUX({
  missionControl:{health:'WATCH',liveData:true,criticalRisks:1,pendingApprovals:2},
  activation:{status:'ACTIVATED',recordsAccepted:10,recordsRejected:1},
  lastUpdatedAt:new Date(Date.now()-30*60000).toISOString(),
  staleAfterMinutes:15
});
t(ux.stale);
t(ux.alertCount===4);
t(ux.activationStatus==='ACTIVATED');
t(ux.acceptedRecords===10);
t(ux.rejectedRecords===1);
t(ux.responsive);
t(ux.accessible);
t(ux.keyboardNavigable);
t(!ux.productionExecutionAuthorized);

const source=fs.readFileSync('src/components/EnterpriseOSPilotReadinessCenter.jsx','utf8');
t(source.includes('Enterprise OS Pilot Readiness'));
t(source.includes('PRODUCTION EXECUTION DISABLED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_SPRINT128_MISSION_CONTROL_OPERATIONAL_UX_HARDENING',
  status:'PASSED',testsRun:n,result:ux
},null,2));

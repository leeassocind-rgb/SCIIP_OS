import assert from'node:assert/strict';
import fs from'node:fs';
import{createPilotTelemetryAndTriage}from'../src/pilot-operations/telemetry/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=createPilotTelemetryAndTriage({
  events:[
    {eventId:'E1',durationMs:100,success:true},
    {eventId:'E2',durationMs:300,success:false}
  ],
  issues:[
    {issueId:'I1',severity:'HIGH',status:'OPEN',evidence:[{}]},
    {issueId:'I2',severity:'CRITICAL',status:'OPEN',evidence:[{},{}]}
  ]
});
t(result.interactions===2);
t(result.failedInteractions===1);
t(result.openIssues===2);
t(result.criticalIssues===1);
t(result.averageDurationMs===200);
t(result.issues[0].issueId==='I2');
t(result.telemetryActive);
t(result.triageActive);
t(!result.productionImpact);

const source=fs.readFileSync('src/components/PilotOperationsCenter.jsx','utf8');
t(source.includes('Controlled Pilot Operations Center'));
t(source.includes('PRODUCTION EXECUTION DISABLED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT131_PILOT_TELEMETRY_AND_ISSUE_TRIAGE',
  status:'PASSED',testsRun:n,result
},null,2));

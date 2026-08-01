import assert from'node:assert/strict';import{createIncidentCommand}from'../src/production-operations/incidents/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createIncidentCommand({incidentId:'INC-1',severity:'CRITICAL',commander:'OPS-1',services:['Search'],evidence:[{source:'telemetry'}]});
t(r.incidentId==='INC-1');t(r.status==='ACTIVE');t(r.commander==='OPS-1');t(r.affectedServices.length===1);t(r.evidence.length===1);t(r.timeline.length===1);t(r.approvalsRequired);t(r.communicationsRequired);t(r.productionWritesGoverned);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT158_INCIDENT_COMMAND',status:'PASSED',testsRun:n,result:r},null,2));

import assert from'node:assert/strict';
import{createApprovalToCanaryHandoff}from'../src/controlled-autonomy/handoff/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const handoff=createApprovalToCanaryHandoff({
 approval:{queueId:'Q1',status:'APPROVED_FOR_CANARY',reviewer:'BROKER-1',evidenceCount:3},
 playbook:{instanceId:'PB-1-P1'},
 checkpoint:{checkpointId:'RB-1'}
});
t(handoff.status==='READY_FOR_CANARY');t(handoff.environment==='CANARY');t(handoff.approvedBy==='BROKER-1');
t(handoff.evidenceCount===3);t(!handoff.productionExecutionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE10_SPRINT108_APPROVAL_TO_CANARY_HANDOFF',status:'PASSED',testsRun:n,result:handoff},null,2));

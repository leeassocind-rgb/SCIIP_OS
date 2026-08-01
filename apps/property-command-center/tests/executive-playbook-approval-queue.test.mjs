import assert from'node:assert/strict';
import{createExecutivePlaybookApprovalQueue}from'../src/autonomous-executive/approval-queue/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const queue=createExecutivePlaybookApprovalQueue({items:[{instanceId:'PB-1-P1',name:'Opportunity Review',context:{subjectId:'P1'}}]});
t(queue.snapshot().pending===1);
const decided=queue.decide({queueId:'PBQ-1',decision:'APPROVE',reviewer:'BROKER-1'});
t(decided[0].status==='APPROVED_FOR_CANARY');t(decided[0].reviewer==='BROKER-1');t(!decided[0].executionAuthorized);
t(queue.snapshot().approved===1);t(!queue.snapshot().executionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE9_SPRINT101_EXECUTIVE_PLAYBOOK_APPROVAL_QUEUE',status:'PASSED',testsRun:n,result:queue.snapshot()},null,2));

import assert from 'node:assert/strict';
import { evaluateBrokerWorkflow } from '../src/executive-assignment-operations/workflow/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=evaluateBrokerWorkflow({
  assignmentId:'A1',
  tasks:[
    {taskId:'T1',status:'IN_PROGRESS'},
    {taskId:'T2',status:'READY'}
  ],
  dependencies:[{from:'T1',to:'T2'}]
});

t(result.assignmentId==='A1');
t(result.total===2);
t(result.blocked===1);
t(result.tasks[1].status==='BLOCKED');
t(result.tasks[1].blockerCount===1);
t(result.workflowVisible);
t(result.permanentHistory);
t(result.brokerControlled);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT226_BROKER_WORKFLOW_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

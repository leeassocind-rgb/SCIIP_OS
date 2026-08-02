import assert from'node:assert/strict';
import{createDealExecutionWorkflow}from'../src/brokerage-operations/deal-execution/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createDealExecutionWorkflow({
  dealId:'D1',
  approvals:[{approvalId:'A1',status:'APPROVED'}],
  steps:[
    {stepId:'S1',label:'Prepare package'},
    {stepId:'S2',label:'Send proposal',approvalId:'A1'},
    {stepId:'S3',label:'Execute document',approvalId:'A2'}
  ]
});
t(r.dealId==='D1');t(r.steps.length===3);t(r.ready===2);t(r.blocked===1);t(r.steps.every(step=>!step.autoExecute));t(r.approvalAware);t(r.permanentHistory);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT230_DEAL_EXECUTION_WORKFLOW',status:'PASSED',testsRun:n,result:r},null,2));

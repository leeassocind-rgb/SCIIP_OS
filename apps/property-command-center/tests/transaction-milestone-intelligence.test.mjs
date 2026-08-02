import assert from'node:assert/strict';
import{evaluateTransactionMilestones}from'../src/brokerage-operations/milestones/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateTransactionMilestones({
  dealId:'D1',
  today:'2026-08-02',
  milestones:[
    {milestoneId:'M1',dueDate:'2026-08-01',status:'OPEN'},
    {milestoneId:'M2',dueDate:'2026-08-06',status:'OPEN'},
    {milestoneId:'M3',dueDate:'2026-08-20',status:'OPEN'}
  ]
});
t(r.total===3);t(r.overdue===1);t(r.atRisk===1);t(r.milestones[0].health==='OVERDUE');t(r.milestones[1].health==='AT_RISK');t(r.evidenceBacked);t(r.brokerReviewRequired);t(!r.autonomousDeadlineChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT231_TRANSACTION_MILESTONE_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));

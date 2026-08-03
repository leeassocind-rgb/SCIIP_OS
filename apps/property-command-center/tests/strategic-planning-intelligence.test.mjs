import assert from'node:assert/strict';import{buildStrategicPlan}from'../src/enterprise-performance/planning/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=buildStrategicPlan({objectives:[{objectiveId:'O1'},{objectiveId:'O2'}],initiatives:[{objectiveId:'O1',status:'COMPLETE'},{objectiveId:'O1',status:'OPEN'},{objectiveId:'O2',status:'COMPLETE'}],dependencies:[{objectiveId:'O1',status:'BLOCKED'}]});
t(r.total===2);t(r.atRisk===1);t(r.complete===1);t(r.objectives[0].progressPct===50);t(r.objectives[0].status==='AT_RISK');t(r.evidenceBacked);t(r.permanentHistory);t(r.executiveApprovalRequired);t(!r.autonomousPlanChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT273_STRATEGIC_PLANNING_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));

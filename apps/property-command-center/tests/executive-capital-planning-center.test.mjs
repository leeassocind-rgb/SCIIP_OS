import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveCapitalPlanning}from'../src/phase18-capital/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveCapitalPlanning({
 allocation:{initiatives:[{initiativeId:'I1',status:'DEFERRED'}]},
 resources:{demands:[{demandId:'D1',status:'CAPACITY_CONSTRAINED'}]},
 portfolio:{investments:[{investmentId:'INV1',status:'LOW_CONFIDENCE'}]},
 stress:{scenarios:[{scenarioId:'S1',atRisk:1}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.executiveCapitalPlanningReady);t(r.executiveApprovalRequired);
t(!r.autonomousAllocationAllowed);t(!r.autonomousInvestmentSelectionAllowed);
const source=fs.readFileSync('src/components/ExecutiveCapitalPlanningCenter.jsx','utf8');
t(source.includes('Strategic Capital Allocation, Resource Optimization & Investment Planning Center'));
t(source.includes('CAPITAL GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT335_EXECUTIVE_CAPITAL_PLANNING_CENTER',status:'PASSED',testsRun:n,result:r},null,2));

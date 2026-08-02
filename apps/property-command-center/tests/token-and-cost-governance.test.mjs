import assert from'node:assert/strict';import{governTokenAndCost}from'../src/enterprise-ai/lifecycle/cost/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=governTokenAndCost({usage:{costUsd:90,tokens:1100000},budgets:{dailyUsd:100,dailyTokens:1000000}});
t(r.costPct===90);t(r.tokenPct===110);t(r.alertCount===2);t(r.alerts.includes('COST_BUDGET_WARNING'));t(r.alerts.includes('TOKEN_BUDGET_EXCEEDED'));t(r.status==='BLOCKED');t(r.approvalRequired);t(!r.autoThrottle);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE16_SPRINT201_TOKEN_AND_COST_GOVERNANCE',status:'PASSED',testsRun:n,result:r},null,2));

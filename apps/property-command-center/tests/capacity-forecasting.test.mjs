import assert from'node:assert/strict';import{forecastCapacity}from'../src/production-operations/capacity/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=forecastCapacity({horizonDays:30,samples:[{cpuPct:40,memoryPct:50,storagePct:60},{cpuPct:41,memoryPct:51,storagePct:61},{cpuPct:42,memoryPct:52,storagePct:62}]});
t(r.horizonDays===30);t(r.projections.cpuPct===72);t(r.projections.memoryPct===82);t(r.projections.storagePct===92);t(r.riskCount===1);t(r.risks.includes('STORAGE_CAPACITY'));t(r.status==='WATCH');t(r.forecasted);t(r.productionWritesGoverned);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT163_CAPACITY_FORECASTING',status:'PASSED',testsRun:n,result:r},null,2));

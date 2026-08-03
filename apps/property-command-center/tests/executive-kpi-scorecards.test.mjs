import assert from'node:assert/strict';import{buildExecutiveScorecards}from'../src/enterprise-performance/scorecards/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=buildExecutiveScorecards({metrics:[{metricId:'M1',actual:110,target:100},{metricId:'M2',actual:70,target:100}]});
t(r.total===2);t(r.onTarget===1);t(r.belowTarget===1);t(r.metrics[0].attainmentPct===110);t(r.metrics[1].status==='BELOW_TARGET');t(r.assumptionsVisible);t(r.executiveReviewRequired);t(!r.autonomousMetricChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT274_EXECUTIVE_KPI_SCORECARDS',status:'PASSED',testsRun:n,result:r},null,2));

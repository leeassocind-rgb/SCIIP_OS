import assert from'node:assert/strict';
import{evaluateEnterpriseKpis}from'../src/phase18-executive-intelligence/kpi/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateEnterpriseKpis({metrics:[
 {metricId:'M1',actual:110,target:100},
 {metricId:'M2',actual:90,target:100},
 {metricId:'M3',actual:70,target:100}
]});
t(r.total===3);t(r.onTarget===1);t(r.watch===1);t(r.offTarget===1);
t(r.metrics[0].attainmentPct===110);t(r.assumptionsVisible);
t(!r.autonomousMetricChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT319_ENTERPRISE_KPI_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));

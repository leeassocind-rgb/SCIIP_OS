import assert from'node:assert/strict';import{optimizePerformance}from'../src/production-operations/performance/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=optimizePerformance({baseline:{apiLatencyMs:600,buildSeconds:3,bundleKb:250,interactionMs:180},targets:{apiLatencyMs:500,buildSeconds:2,bundleKb:220,interactionMs:200}});
t(r.recommendationCount===3);t(r.recommendations.includes('OPTIMIZE_API_PATH'));t(r.recommendations.includes('OPTIMIZE_BUILD'));t(r.recommendations.includes('REDUCE_BUNDLE'));t(!r.recommendations.includes('OPTIMIZE_INTERACTION'));t(r.status==='OPTIMIZATION_REQUIRED');t(r.evidenceRequired);t(r.approvalRequired);t(!r.changesAutoApplied);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT164_PERFORMANCE_OPTIMIZATION',status:'PASSED',testsRun:n,result:r},null,2));

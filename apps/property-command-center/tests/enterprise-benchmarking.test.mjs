import assert from'node:assert/strict';
import{evaluateEnterpriseBenchmarks}from'../src/enterprise-operating-model/benchmarking/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateEnterpriseBenchmarks({
 metrics:[{metricId:'M1',actual:110},{metricId:'M2',actual:8}],
 benchmarks:[{metricId:'M1',target:100,direction:'HIGHER_IS_BETTER'},{metricId:'M2',target:5,direction:'LOWER_IS_BETTER'}]
});
t(r.total===2);t(r.favorable===1);t(r.belowBenchmark===1);t(r.metrics[0].status==='AT_OR_ABOVE_BENCHMARK');t(r.metrics[1].status==='BELOW_BENCHMARK');t(r.assumptionsVisible);t(r.evidenceBacked);t(!r.autonomousTargetChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT279_ENTERPRISE_BENCHMARKING',status:'PASSED',testsRun:n,result:r},null,2));

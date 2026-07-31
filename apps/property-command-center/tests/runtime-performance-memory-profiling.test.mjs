import assert from'node:assert/strict';
import{
  generateSyntheticSuperSheet,
  runLargeSuperSheetStress
}from'../src/production-hardening/ingestion/index.js';
import{
  profileRuntimeWorkload,
  evaluateRuntimeProfile
}from'../src/production-hardening/performance/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const fixture=generateSyntheticSuperSheet({rows:25000});
const profile=await profileRuntimeWorkload({
  name:'25k-row-supersheet',
  iterations:5,
  workload:()=>runLargeSuperSheetStress({
    text:fixture.text,
    chunkSize:2500,
    checkpointEvery:5000
  })
});
t(profile.name==='25k-row-supersheet');
t(profile.iterations===5);
t(profile.samples.length===5);
t(profile.minMs>=0);
t(profile.maxMs>=profile.minMs);
t(profile.averageMs>=profile.minMs);
t(profile.p50Ms>=profile.minMs);
t(profile.p95Ms>=profile.p50Ms);
t(Number.isFinite(profile.heapDeltaBytes));
t(profile.profilingAvailable);
t(profile.repeatable);
t(profile.samples.every(item=>item.resultSummary.processedRows===25000));
t(Object.isFrozen(profile));

const certification=evaluateRuntimeProfile(profile,{
  maximumP95Ms:5000,
  maximumHeapDeltaMb:512,
  bundleKb:400,
  loadMs:1800,
  queryMs:250
});
t(certification.passed);
t(certification.status==='PERFORMANCE_CERTIFIED');
t(certification.gates.latency);
t(certification.gates.memory);
t(certification.gates.existingPerformanceBudget);
t(certification.gates.repeatable);
t(certification.existingBudget.status==='WITHIN_BUDGET');

const failed=evaluateRuntimeProfile({...profile,p95Ms:9999},{maximumP95Ms:100});
t(!failed.passed);
t(failed.status==='PERFORMANCE_BUDGET_EXCEEDED');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE4_SPRINT44_RUNTIME_PERFORMANCE_MEMORY_PROFILING',
  status:'PASSED',
  testsRun:tests,
  result:{
    workload:profile.name,
    iterations:profile.iterations,
    averageMs:profile.averageMs,
    p50Ms:profile.p50Ms,
    p95Ms:profile.p95Ms,
    heapDeltaMb:certification.heapDeltaMb,
    performanceBudget:certification.existingBudget.status,
    profilingAvailable:true,
    repeatable:true,
    certificationStatus:certification.status
  }
},null,2));

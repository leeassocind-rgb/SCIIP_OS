import assert from'node:assert/strict';import fs from'node:fs';import{analyzeReleasePerformance}from'../src/production-operations/release-analytics/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=analyzeReleasePerformance({before:{apiLatencyMs:100,buildSeconds:2,bundleKb:200,errorRatePct:1},after:{apiLatencyMs:120,buildSeconds:1.5,bundleKb:190,errorRatePct:.5}});
t(r.metrics.apiLatencyDeltaMs===20);t(r.metrics.buildDeltaSeconds===-.5);t(r.metrics.bundleDeltaKb===-10);t(r.metrics.errorRateDeltaPct===-.5);t(r.regressionCount===1);t(r.status==='REGRESSION_DETECTED');t(r.releaseApprovalRequired);t(r.evidenceBacked);t(!r.autonomousRollbackAllowed);
const s=fs.readFileSync('src/components/CapacityPerformanceOptimizationCenter.jsx','utf8');t(s.includes('Capacity & Performance Optimization Center'));t(s.includes('OPTIMIZATIONS REQUIRE APPROVAL'));
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT167_RELEASE_PERFORMANCE_ANALYTICS',status:'PASSED',testsRun:n,result:r},null,2));

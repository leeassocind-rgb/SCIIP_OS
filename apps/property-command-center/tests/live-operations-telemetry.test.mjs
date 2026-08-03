import assert from'node:assert/strict';
import{aggregateLiveOperationsTelemetry}from'../src/production-operations/telemetry/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=aggregateLiveOperationsTelemetry({
 samples:[
  {queueDepth:10,apiLatencyMs:100,memoryUtilizationPct:50,eventLagMs:100,ingestionThroughputPerMinute:100},
  {queueDepth:20,apiLatencyMs:120,memoryUtilizationPct:60,eventLagMs:150,ingestionThroughputPerMinute:140,
   processingLatencyMs:80,workerUtilizationPct:70,cacheHitRatePct:92,storageUtilizationPct:60}
 ]
});
t(result.samples===2);
t(result.metrics.queueDepth===20);
t(result.metrics.apiLatencyMs===120);
t(result.metrics.cacheHitRatePct===92);
t(result.trends.averageQueueDepth===15);
t(result.trends.averageIngestionThroughputPerMinute===120);
t(result.alertCount===0);
t(result.status==='OPERATIONAL');
t(result.realTime);
t(result.historicalTrends);
t(result.productionWritesGoverned);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
 framework:'SCIIP_PHASE15_SPRINT149_LIVE_OPERATIONS_TELEMETRY',
 status:'PASSED',testsRun:n,result
},null,2));

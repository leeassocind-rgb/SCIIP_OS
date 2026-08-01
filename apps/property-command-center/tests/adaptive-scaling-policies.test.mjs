import assert from'node:assert/strict';import{evaluateScalingPolicy}from'../src/production-operations/scaling/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateScalingPolicy({metrics:{workers:3,queueDepth:150},policy:{minWorkers:1,maxWorkers:5,scaleOutQueueDepth:100,scaleInQueueDepth:10}});
t(r.currentWorkers===3);t(r.recommendedWorkers===4);t(r.reason==='SCALE_OUT');t(r.withinBounds);t(r.approvalRequired);t(!r.autoScaleApplied);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT166_ADAPTIVE_SCALING_POLICIES',status:'PASSED',testsRun:n,result:r},null,2));

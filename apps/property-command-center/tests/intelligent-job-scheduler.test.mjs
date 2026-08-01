import assert from'node:assert/strict';
import{scheduleEnterpriseJobs}from'../src/production-operations/scheduler/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=scheduleEnterpriseJobs({capacity:2,jobs:[
 {jobId:'J1',priority:5},{jobId:'J2',priority:10},{jobId:'J3',priority:1}
]});
t(r.scheduled.length===2);t(r.deferred.length===1);t(r.scheduled[0].jobId==='J2');t(r.scheduled[1].jobId==='J1');t(r.priorityAware);t(r.dependencyAware);t(r.approvalRequired);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT153_INTELLIGENT_JOB_SCHEDULER',status:'PASSED',testsRun:n,result:r},null,2));

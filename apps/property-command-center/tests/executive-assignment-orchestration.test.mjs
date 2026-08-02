import assert from 'node:assert/strict';
import { orchestrateExecutiveAssignment } from '../src/executive-assignment-operations/orchestration/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=orchestrateExecutiveAssignment({
  assignmentId:'A1',
  objectives:[{objectiveId:'O1',label:'Advance requirement'}],
  workstreams:[
    {workstreamId:'W1',objectiveId:'O1',completionPct:90,evidenceCoveragePct:90,ownerConfidencePct:85},
    {workstreamId:'W2',objectiveId:'O1',completionPct:40,evidenceCoveragePct:50,ownerConfidencePct:60}
  ],
  approvals:[{workstreamId:'W1',status:'APPROVED'}]
});

t(result.assignmentId==='A1');
t(result.total===2);
t(result.ready===1);
t(result.atRisk===1);
t(result.workstreams[0].workstreamId==='W1');
t(result.executiveReviewRequired);
t(result.evidenceRequired);
t(result.permanentHistory);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT223_EXECUTIVE_ASSIGNMENT_ORCHESTRATION',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

import assert from 'node:assert/strict';
import { processAssignmentSignals } from '../src/assignment-intelligence/signals/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=processAssignmentSignals({
  assignmentId:'A1',
  signals:[
    {signalId:'S1',type:'COMP_CHANGE',subjectId:'P1',confidence:.9,urgency:.8,impact:.9,freshness:.9,evidence:[{}]},
    {signalId:'S2',type:'DOCUMENT_UPDATE',subjectId:'D1',confidence:.4,urgency:.2,impact:.3,freshness:.7}
  ]
});

t(result.assignmentId==='A1');
t(result.total===2);
t(result.active===1);
t(result.topSignal.signalId==='S1');
t(result.topSignal.evidence.length===1);
t(result.evidenceBacked);
t(result.permanentHistory);
t(result.productionWritesGoverned);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT217_ASSIGNMENT_SIGNAL_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

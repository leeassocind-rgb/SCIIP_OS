import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createExecutiveAssignmentCommand } from '../src/executive-assignment-operations/command/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=createExecutiveAssignmentCommand({
  assignment:{assignmentId:'A1'},
  orchestration:{workstreams:[{workstreamId:'W1',status:'AT_RISK'}]},
  decisionSupport:{topAlternative:{alternativeId:'A'}},
  relationshipPlans:{plans:[{actionId:'RA1',recommendedAction:'CONTACT_NOW'}]},
  workflow:{tasks:[{taskId:'T1',status:'BLOCKED'}]},
  approvals:[{approvalId:'AP1',status:'PENDING'}]
});

t(result.assignment.assignmentId==='A1');
t(result.commandCount===4);
t(result.commands.some(item=>item.type==='WORKSTREAM'));
t(result.commands.some(item=>item.type==='RELATIONSHIP'));
t(result.commands.some(item=>item.type==='WORKFLOW'));
t(result.commands.some(item=>item.type==='APPROVAL'));
t(result.evidenceBacked);
t(result.executiveReviewRequired);
t(result.brokerControlPreserved);
t(!result.autonomousExecutionAllowed);

const source=fs.readFileSync('src/components/ExecutiveAssignmentOperationsCenter.jsx','utf8');
t(source.includes('Executive Assignment Operations Center'));
t(source.includes('BROKER CONTROL PRESERVED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT227_EXECUTIVE_ASSIGNMENT_COMMAND_CENTER',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

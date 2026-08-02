import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createExecutiveAssignmentIntelligence } from '../src/assignment-intelligence/executive/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=createExecutiveAssignmentIntelligence({
  assignment:{assignmentId:'A1'},
  signals:[{signalId:'S1',status:'ACTIVE',score:.9}],
  relationships:[{personId:'R1',status:'FOLLOW_UP',opportunityScore:30}],
  matches:[{propertyId:'P1'}],
  strategy:{candidateCount:1},
  decisions:[{decisionId:'D1',approvalRequired:true}]
});

t(result.assignment.assignmentId==='A1');
t(result.attentionCount===3);
t(result.signals.length===1);
t(result.relationships.length===1);
t(result.strategy.candidateCount===1);
t(result.evidenceBacked);
t(result.citationsRequired);
t(result.brokerReviewRequired);
t(!result.autonomousPublishingAllowed);

const source=fs.readFileSync('src/components/AssignmentRelationshipIntelligenceCenter.jsx','utf8');
t(source.includes('Assignment & Relationship Intelligence Center'));
t(source.includes('BROKER REVIEW REQUIRED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT221_EXECUTIVE_ASSIGNMENT_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

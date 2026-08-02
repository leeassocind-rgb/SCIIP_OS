import assert from 'node:assert/strict';
import { evaluateAssignmentPropertyStrategy } from '../src/assignment-intelligence/property-strategy/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=evaluateAssignmentPropertyStrategy({
  assignmentId:'A1',
  constraints:{minimumEvidence:2,maximumRisk:30},
  properties:[
    {propertyId:'P1',opportunityScore:80,riskScore:20,evidenceCount:4,executionFit:25},
    {propertyId:'P2',opportunityScore:70,riskScore:40,evidenceCount:3,executionFit:20}
  ]
});

t(result.assignmentId==='A1');
t(result.candidateCount===1);
t(result.topCandidate.propertyId==='P1');
t(result.topCandidate.score===97);
t(result.constraintsApplied);
t(result.evidenceRequired);
t(result.approvalRequired);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT220_ASSIGNMENT_PROPERTY_STRATEGY',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

import assert from 'node:assert/strict';
import { planRelationshipActions } from '../src/executive-assignment-operations/relationship-actions/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=planRelationshipActions({
  assignmentId:'A1',
  relationships:[
    {personId:'R1',opportunityScore:24,strategicValue:5},
    {personId:'R2',opportunityScore:5,strategicValue:2}
  ],
  signals:[{personId:'R1',relevance:.8}]
});

t(result.assignmentId==='A1');
t(result.total===2);
t(result.immediate===1);
t(result.topPlan.personId==='R1');
t(result.topPlan.recommendedAction==='CONTACT_NOW');
t(result.topPlan.approvalRequired);
t(result.brokerReviewRequired);
t(result.evidenceBacked);
t(!result.autonomousOutreachAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT225_RELATIONSHIP_ACTION_PLANNING',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

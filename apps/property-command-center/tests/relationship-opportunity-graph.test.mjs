import assert from 'node:assert/strict';
import { buildRelationshipOpportunityGraph } from '../src/assignment-intelligence/relationships/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=buildRelationshipOpportunityGraph({
  assignmentId:'A1',
  people:[
    {personId:'R1',name:'Contact 1',strategicValue:10},
    {personId:'R2',name:'Contact 2',strategicValue:2}
  ],
  relationships:[{from:'R1',to:'P1',type:'REPRESENTS'}],
  activity:[{personId:'R1',relevance:.9}]
});

t(result.nodeCount===2);
t(result.edgeCount===1);
t(result.topRelationship.personId==='R1');
t(result.topRelationship.status==='FOLLOW_UP');
t(result.graphNative);
t(result.evidenceBacked);
t(result.approvalRequired);
t(!result.autonomousOutreachAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT218_RELATIONSHIP_OPPORTUNITY_GRAPH',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

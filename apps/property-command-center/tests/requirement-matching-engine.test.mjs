import assert from 'node:assert/strict';
import { matchRequirements } from '../src/assignment-intelligence/matching/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=matchRequirements({
  requirement:{requirementId:'REQ-1'},
  properties:[
    {propertyId:'P1',label:'Site A',evidenceCount:3,scores:{size:90,location:80,power:95,clearHeight:90,timing:70,economics:75}},
    {propertyId:'P2',label:'Site B',evidenceCount:2,scores:{size:75,location:85,power:70,clearHeight:80,timing:90,economics:80}}
  ]
});

t(result.requirementId==='REQ-1');
t(result.total===2);
t(result.matched===2);
t(result.topMatch.propertyId==='P1');
t(result.topMatch.score>80);
t(result.explainable);
t(result.evidenceRequired);
t(result.approvalRequired);
t(!result.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT219_REQUIREMENT_MATCHING_ENGINE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

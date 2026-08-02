import assert from 'node:assert/strict';
import { evaluateDealRequirementDecision } from '../src/executive-assignment-operations/decision-support/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const result=evaluateDealRequirementDecision({
  decisionId:'D1',
  alternatives:[
    {alternativeId:'A',label:'Property A',evidenceCount:4,dimensions:{fit:95,economics:80,timing:90,risk:20,relationship:75}},
    {alternativeId:'B',label:'Property B',evidenceCount:3,dimensions:{fit:85,economics:90,timing:70,risk:30,relationship:65}}
  ]
});

t(result.decisionId==='D1');
t(result.total===2);
t(result.topAlternative.alternativeId==='A');
t(result.topAlternative.score>80);
t(result.explainable);
t(result.evidenceRequired);
t(result.approvalRequired);
t(!result.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT224_DEAL_REQUIREMENT_DECISION_SUPPORT',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

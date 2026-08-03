import assert from 'node:assert/strict';
import { buildExecutiveDecisionSupport } from '../src/enterprise-planning/decision-support/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildExecutiveDecisionSupport({
  decisions:[
    {decisionId:'D1',rewardScore:90,riskScore:20},
    {decisionId:'D2',rewardScore:70,riskScore:15}
  ],
  evidence:[
    {decisionId:'D1',confidence:.9},
    {decisionId:'D1',confidence:.8},
    {decisionId:'D2',confidence:.6}
  ]
});

t(r.total===2);
t(r.topDecision.decisionId==='D1');
t(r.topDecision.evidenceCount===2);
t(r.topDecision.confidence===.85);
t(r.evidenceChainPreserved);
t(r.permanentHistory);
t(r.approvalRequired);
t(!r.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT250_EXECUTIVE_DECISION_SUPPORT',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));

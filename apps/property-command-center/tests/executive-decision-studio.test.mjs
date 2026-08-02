import assert from'node:assert/strict';
import fs from'node:fs';
import{evaluateExecutiveDecision}from'../src/enterprise-ai/decision-studio/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=evaluateExecutiveDecision({
  decisionId:'D1',
  weights:{fit:2,risk:-1},
  scenarios:[
    {scenarioId:'A',dimensions:{fit:40,risk:10},evidenceCount:3},
    {scenarioId:'B',dimensions:{fit:35,risk:5},evidenceCount:4}
  ]
});
t(result.scenarioCount===2);
t(result.winner.scenarioId==='A');
t(result.winner.score===70);
t(result.scenarios[1].score===65);
t(result.evidenceRequired);
t(result.approvalRequired);
t(result.confidenceVisible);
t(!result.productionExecutionAuthorized);

const source=fs.readFileSync('src/components/EnterpriseAIOperatingSystemCenter.jsx','utf8');
t(source.includes('Enterprise AI Operating System Center'));
t(source.includes('EVIDENCE & APPROVAL REQUIRED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_SPRINT184_EXECUTIVE_DECISION_STUDIO',
  status:'PASSED',
  testsRun:n,
  result
},null,2));

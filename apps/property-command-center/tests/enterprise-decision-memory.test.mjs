import assert from 'node:assert/strict';
import { createEnterpriseDecisionMemory } from '../src/enterprise-runtime/decision-memory/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const memory=createEnterpriseDecisionMemory();
const decision=memory.recordDecision({
  decisionId:'DEC-100',
  label:'Prioritize leasing strategy',
  rationale:'Fastest risk-adjusted path',
  assumptions:['Demand remains stable'],
  evidence:[{source:'SCENARIO_SIMULATION'}],
  approvals:[{approvalId:'APP-1',reviewer:'PRINCIPAL-1'}],
  selectedScenarioId:'S1'
});
const duplicate=memory.recordDecision({decisionId:'DEC-100'});
const outcome=memory.recordOutcome({
  outcomeId:'OUT-100',
  decisionId:'DEC-100',
  result:'SUCCESS',
  metrics:{leasedSf:100000}
});

const query=memory.query('DEC-100');
const lessons=memory.lessons();

t(decision.status==='RECORDED');
t(duplicate.status==='DUPLICATE_SKIPPED');
t(outcome.status==='RECORDED');
t(query.outcomes.length===1);
t(query.learnedFromOutcome);
t(query.explainable);
t(lessons.length===1);
t(lessons[0].recommendation==='RETAIN_DECISION_PATTERN');
t(!lessons[0].policyChangesAutoApplied);
t(lessons[0].humanReviewRequired);
t(memory.snapshot().organizationalLearning);
t(memory.snapshot().appendOnly);
t(!memory.snapshot().productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT119_ENTERPRISE_DECISION_MEMORY',
  status:'PASSED',
  testsRun:tests,
  result:memory.snapshot()
},null,2));

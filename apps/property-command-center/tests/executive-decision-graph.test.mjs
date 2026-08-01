import assert from 'node:assert/strict';
import { createExecutiveDecisionGraph } from '../src/enterprise-runtime/decision-graph/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const graph=createExecutiveDecisionGraph();
const result=graph.recordDecision({
  decisionId:'DEC-1',
  label:'Prioritize Rialto pursuit',
  propertyIds:['P1'],
  marketIds:['M1'],
  peopleIds:['PERSON-1'],
  approvalIds:['APP-1'],
  outcomeIds:['OUT-1'],
  evidence:[{source:'SuperSheet',recordId:'ROW-1'}]
});

const query=graph.queryDecision('DEC-1');
t(result.relatedNodes===5);
t(query.relationships.length===5);
t(query.relatedNodes.length===5);
t(query.evidence.length===1);
t(graph.snapshot().queryable);
t(graph.snapshot().evidenceLinked);
t(graph.snapshot().appendOnly);
t(!graph.snapshot().productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT114_EXECUTIVE_DECISION_GRAPH',
  status:'PASSED',
  testsRun:tests,
  result:graph.snapshot()
},null,2));

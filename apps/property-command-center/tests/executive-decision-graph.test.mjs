import assert from 'node:assert/strict';
import { buildExecutiveDecisionGraph } from '../src/intelligence-platform/decision-graph/index.js';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const result = buildExecutiveDecisionGraph({
  decisionId: 'D1',
  alternatives: [
    { alternativeId: 'A', label: 'Acquire' },
    { alternativeId: 'B', label: 'Lease' }
  ],
  evidence: [
    { alternativeId: 'A', confidence: .9 },
    { alternativeId: 'A', confidence: .8 },
    { alternativeId: 'B', confidence: .7 }
  ],
  dependencies: [{ from: 'A', to: 'B', type: 'COMPARED_WITH' }]
});

t(result.nodeCount === 2);
t(result.edgeCount === 1);
t(result.nodes[0].evidenceCount === 2);
t(result.nodes[0].confidence === .85);
t(result.evidenceLinked);
t(result.permanentHistory);
t(result.explainable);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_SPRINT208_EXECUTIVE_DECISION_GRAPH',
  status: 'PASSED',
  testsRun: n,
  result
}, null, 2));

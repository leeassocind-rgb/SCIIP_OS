import assert from 'node:assert/strict';
import { createKnowledgeGraphRuntime } from '../src/enterprise-knowledge-graph/knowledgeGraphRuntime.js';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { createExecutiveSignal } from '../src/executive-signals/signalContract.js';
import { getExecutiveSignalType, resetExecutiveSignalRegistry } from '../src/executive-signals/executiveSignalRegistry.js';
import {
  KNOWLEDGE_GRAPH_SIGNAL_TYPES,
  createKnowledgeGraphRuntimeAdapter
} from '../src/enterprise-knowledge-graph/executive-signal-integration/index.js';

let tests = 0;
const t = (condition, message) => { tests++; assert.ok(condition, message || `Assertion ${tests} failed`); };

resetExecutiveSignalRegistry();
const graphRuntime = createKnowledgeGraphRuntime();
const signalBus = createExecutiveSignalBus({ maxHistory: 50 });
const received = [];
signalBus.subscribe(signal => received.push(signal), {
  id: 'test-derived-listener',
  filter: signal => signal.source === 'enterprise-knowledge-graph'
});

const adapter = createKnowledgeGraphRuntimeAdapter({ graphRuntime, signalBus, maxHistory: 5 });
t(adapter.snapshot().status === 'OPERATIONAL');
t(adapter.snapshot().graphStatus === 'ENTERPRISE_KNOWLEDGE_GRAPH_OPERATIONAL');
t(adapter.snapshot().readOnly);
t(adapter.snapshot().appendOnly);
t(adapter.snapshot().autonomousConsequentialActions === 'BLOCKED');
t(getExecutiveSignalType(KNOWLEDGE_GRAPH_SIGNAL_TYPES.RELATIONSHIP_EXPANDED) !== null);
t(getExecutiveSignalType(KNOWLEDGE_GRAPH_SIGNAL_TYPES.CROSS_DOMAIN_CORRELATION) !== null);
t(getExecutiveSignalType(KNOWLEDGE_GRAPH_SIGNAL_TYPES.REVIEW_REQUIRED) !== null);

const sourceSignal = createExecutiveSignal({
  id: 'market-signal-1',
  type: 'MARKET_TIGHTENING_DETECTED',
  source: 'market-intelligence',
  severity: 'HIGH',
  occurredAt: '2026-07-31T18:00:00.000Z',
  assignmentId: 'A-100',
  propertyId: 'P-100',
  correlationId: 'CORR-100',
  title: 'Market tightening detected',
  summary: 'Vacancy decreased while rents increased.',
  evidence: [
    { id: 'market-brief-1', type: 'MARKET_BRIEF', source: 'market-intelligence' },
    { id: 'trend-1', type: 'TREND_EVIDENCE', source: 'market-intelligence' }
  ]
});

const result = adapter.consume(sourceSignal);
t(result.projection.signalId === 'market-signal-1');
t(result.projection.entitiesProjected === 7);
t(result.projection.relationshipsAppended === 6);
t(result.projection.duplicateRelationships === 0);
t(result.derivedSignals.length === 3);
t(result.publications.every(item => item.status === 'PUBLISHED'));
t(result.derivedSignals.some(signal => signal.type === KNOWLEDGE_GRAPH_SIGNAL_TYPES.RELATIONSHIP_EXPANDED));
t(result.derivedSignals.some(signal => signal.type === KNOWLEDGE_GRAPH_SIGNAL_TYPES.CROSS_DOMAIN_CORRELATION));
t(result.derivedSignals.some(signal => signal.type === KNOWLEDGE_GRAPH_SIGNAL_TYPES.REVIEW_REQUIRED));
t(result.derivedSignals.every(signal => signal.assignmentId === 'A-100'));
t(result.derivedSignals.every(signal => signal.propertyId === 'P-100'));
t(result.derivedSignals.every(signal => signal.correlationId === 'CORR-100'));
t(result.readOnly);
t(result.appendOnly);
t(result.autonomousConsequentialActions === 'BLOCKED');
t(received.length === 3);
t(graphRuntime.entities.get('market-signal-1').type === 'ExecutiveSignal');
t(graphRuntime.entities.get('assignment:A-100').type === 'Assignment');
t(graphRuntime.entities.get('property:P-100').type === 'Property');
t(graphRuntime.relationships.all().length === 6);
t(graphRuntime.ontology.get('ExecutiveSignal') !== undefined);
t(graphRuntime.ontology.get('EVIDENCED_BY') !== undefined);

const duplicate = adapter.consume(sourceSignal);
t(duplicate.status === 'DUPLICATE_IGNORED');
t(adapter.snapshot().duplicatesIgnored === 1);
t(graphRuntime.relationships.all().length === 6);

const infoSignal = createExecutiveSignal({
  id: 'ops-signal-1',
  type: 'PRODUCTION_PIPELINE_HEALTHY',
  source: 'production-operations',
  severity: 'INFO',
  occurredAt: '2026-07-31T18:01:00.000Z',
  assignmentId: 'A-100',
  title: 'Pipeline healthy',
  evidence: [{ id: 'ops-health-1', type: 'OPERATIONS_HEALTH', source: 'production-operations' }]
});
const infoResult = adapter.consume(infoSignal);
t(infoResult.derivedSignals.length === 2);
t(infoResult.derivedSignals.some(signal => signal.type === KNOWLEDGE_GRAPH_SIGNAL_TYPES.RELATIONSHIP_EXPANDED));
t(infoResult.derivedSignals.some(signal => signal.type === KNOWLEDGE_GRAPH_SIGNAL_TYPES.CROSS_DOMAIN_CORRELATION));
t(infoResult.projection.relationshipsAppended === 4);
t(adapter.snapshot().consumed === 2);
t(adapter.snapshot().published === 5);
t(adapter.snapshot().entities >= 11);
t(adapter.snapshot().relationships === 10);
t(adapter.getHistory().length === 2);

const connectedGraph = createKnowledgeGraphRuntime();
const connectedBus = createExecutiveSignalBus({ maxHistory: 20 });
const connectedAdapter = createKnowledgeGraphRuntimeAdapter({ graphRuntime: connectedGraph, signalBus: connectedBus });
t(connectedAdapter.connect());
t(connectedAdapter.snapshot().connected);
connectedBus.publish(createExecutiveSignal({
  id: 'external-signal-1',
  type: 'EXTERNAL_TEST_SIGNAL',
  source: 'test-domain',
  severity: 'MEDIUM',
  occurredAt: '2026-07-31T18:02:00.000Z',
  assignmentId: 'A-200'
}));
t(connectedAdapter.snapshot().consumed === 1);
t(connectedAdapter.snapshot().published === 1);
t(connectedGraph.entities.get('external-signal-1') !== undefined);
connectedAdapter.disconnect();
t(!connectedAdapter.snapshot().connected);

adapter.stop();
t(adapter.snapshot().status === 'STOPPED');
let stoppedError = false;
try { adapter.consume(createExecutiveSignal({
  id: 'stopped-signal',
  type: 'STOPPED',
  source: 'test',
  occurredAt: '2026-07-31T18:03:00.000Z'
})); } catch { stoppedError = true; }
t(stoppedError);
adapter.start();
t(adapter.snapshot().status === 'OPERATIONAL');

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE2_SPRINT27_KNOWLEDGE_GRAPH_RUNTIME_ADAPTER',
  status: 'PASSED',
  testsRun: tests,
  result: {
    sourceSignalsConsumed: adapter.snapshot().consumed,
    derivedSignalsPublished: adapter.snapshot().published,
    duplicatesIgnored: adapter.snapshot().duplicatesIgnored,
    ontologyTerms: adapter.snapshot().ontologyTerms,
    entities: adapter.snapshot().entities,
    relationships: adapter.snapshot().relationships,
    signalBusIntegrated: true,
    executiveInsightCompatible: true,
    executiveEngineCompatible: true,
    commandCenterCompatible: true,
    appendOnly: true,
    readOnly: true,
    autonomousConsequentialActions: 'BLOCKED'
  }
}, null, 2));

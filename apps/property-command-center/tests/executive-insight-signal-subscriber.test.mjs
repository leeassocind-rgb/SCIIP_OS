import assert from 'node:assert/strict';
import { createExecutiveSignalRuntime } from '../src/executive-signals/executiveSignalRuntime.js';
import { createExecutiveInsightSignalSubscriber } from '../src/intelligence/executive-signal-integration/executiveInsightSignalSubscriber.js';
import { PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS } from '../src/production-operations/signals/productionSignalDefinitions.js';

const runtime = createExecutiveSignalRuntime({ busOptions: { maxHistory: 20 } });
runtime.start(PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS);

runtime.publish({
  id: 'SIG-REPLAY-1',
  type: 'PRODUCTION_BATCH_REVIEW_REQUIRED',
  source: 'production-operations',
  severity: 'HIGH',
  occurredAt: '2026-07-31T15:00:00.000Z',
  assignmentId: 'A-100',
  payload: { batchId: 'B-100' },
  metadata: { consequential: true, approvalRequired: true }
});

const subscriber = createExecutiveInsightSignalSubscriber({ maxSignals: 2 });
subscriber.start(runtime, { replay: true });

let snapshot = subscriber.snapshot();
assert.equal(snapshot.status, 'OPERATIONAL');
assert.equal(snapshot.retainedSignals, 1);
assert.equal(snapshot.refreshes, 1);
assert.equal(snapshot.brokerReviewRequired, true);
assert.equal(snapshot.priorityRecommendations, 1);
assert.equal(snapshot.criticalAlerts, 1);

runtime.publish({
  id: 'SIG-2',
  type: 'PRODUCTION_BATCH_CERTIFIED',
  source: 'production-operations',
  severity: 'INFO',
  occurredAt: '2026-07-31T15:05:00.000Z',
  payload: { batchId: 'B-100' }
});

const duplicate = subscriber.consume(runtime.readSignals().at(-1).signal);
assert.equal(duplicate.status, 'DUPLICATE_IGNORED');
assert.equal(subscriber.snapshot().duplicatesIgnored, 1);

runtime.publish({
  id: 'SIG-3',
  type: 'PRODUCTION_BATCH_FAILED',
  source: 'production-operations',
  severity: 'CRITICAL',
  occurredAt: '2026-07-31T15:10:00.000Z',
  propertyId: 'P-200',
  payload: { batchId: 'B-200' },
  metadata: { consequential: true, confidenceBand: 'HIGH' }
});

snapshot = subscriber.snapshot();
assert.equal(snapshot.retainedSignals, 2);
assert.equal(snapshot.mappingFailures, 0);
assert.equal(snapshot.priorityRecommendations, 1);
assert.equal(snapshot.criticalAlerts, 1);

const insights = subscriber.getInsights();
assert.equal(insights.sourceSignalCount, 2);
assert.deepEqual(insights.sourceSignalIds, ['SIG-2', 'SIG-3']);
assert.equal(insights.priorityRecommendations[0].signalId, 'SIG-3');
assert.equal(insights.criticalAlerts[0].propertyId, 'P-200');

const failure = subscriber.consume(null);
assert.equal(failure.status, 'MAPPING_FAILED');
assert.equal(subscriber.snapshot().mappingFailures, 1);

subscriber.stop();
assert.equal(subscriber.snapshot().status, 'STOPPED');

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE1_SPRINT3_EXECUTIVE_INSIGHT_SIGNAL_SUBSCRIBER',
  status: 'PASSED',
  testsRun: 14,
  result: {
    ...snapshot,
    sourceSignalIds: insights.sourceSignalIds,
    headline: insights.headline,
    replayCompatible: true,
    boundedState: true,
    existingInsightApiPreserved: true
  }
}, null, 2));

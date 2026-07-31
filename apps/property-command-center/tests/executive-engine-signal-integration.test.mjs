import assert from 'node:assert/strict';
import { aggregateExecutiveState, buildExecutiveBriefing, executiveTimeline } from '../src/executive/executiveEngine.js';
import { createExecutiveEngineSignalIntegration, mapInsightsToExecutiveDecision } from '../src/executive/signal-integration/index.js';

let testsRun = 0;
const test = (name, fn) => { fn(); testsRun += 1; };

const insights = Object.freeze({
  generatedAt: '2026-07-31T15:00:00.000Z',
  headline: '1 priority intelligence item require review',
  brokerReviewRequired: true,
  sourceSignalIds: ['SIG-9'],
  priorityRecommendations: [{ id: 'REC-9', consequential: true, approvalRequired: true, action: 'Review production certification failure', evidence: [{ id: 'SIG-9' }] }],
  criticalAlerts: [{ id: 'SIG-9', type: 'PRODUCTION_BATCH_FAILED', severity: 'CRITICAL' }]
});

const subscriber = { getInsights: () => insights };
const integration = createExecutiveEngineSignalIntegration({ maxDecisions: 2 });

test('maps insight output to an executive decision', () => assert.equal(mapInsightsToExecutiveDecision(insights).status, 'ATTENTION_REQUIRED'));
test('preserves critical severity', () => assert.equal(mapInsightsToExecutiveDecision(insights).severity, 'CRITICAL'));
test('propagates broker review requirement', () => assert.equal(mapInsightsToExecutiveDecision(insights).brokerReviewRequired, true));
test('preserves source signal traceability', () => assert.deepEqual(mapInsightsToExecutiveDecision(insights).sourceSignalIds, ['SIG-9']));
test('starts against the existing subscriber API', () => assert.equal(integration.start(subscriber).status, 'OPERATIONAL'));
test('evaluates the current insight snapshot', () => assert.equal(integration.getDecision().immediateAction, 'Review production certification failure'));
test('suppresses duplicate decisions', () => assert.equal(integration.poll().status, 'DUPLICATE_IGNORED'));
test('retains bounded decision history', () => { integration.evaluate({ ...insights, generatedAt: '2026-07-31T15:01:00.000Z' }); integration.evaluate({ ...insights, generatedAt: '2026-07-31T15:02:00.000Z' }); assert.equal(integration.getDecisionHistory().length, 2); });
test('builds unified executive snapshots', () => assert.equal(integration.buildSnapshot({ assignment: { id: 'A-1' } }).decision.status, 'ATTENTION_REQUIRED'));
test('preserves aggregateExecutiveState API', () => assert.equal(aggregateExecutiveState({ assignment: { id: 'A-1' } }).assignmentId, 'A-1'));
test('preserves buildExecutiveBriefing API', () => assert.ok(buildExecutiveBriefing(aggregateExecutiveState()).headline));
test('preserves executiveTimeline API', () => assert.deepEqual(executiveTimeline(), []));
test('isolates missing subscriber failures', () => assert.equal(createExecutiveEngineSignalIntegration().poll().status, 'EVALUATION_FAILED'));
test('reports operational metrics', () => assert.equal(integration.snapshot().evaluationFailures, 0));
test('stops cleanly', () => assert.equal(integration.stop().status, 'STOPPED'));

console.log(JSON.stringify({ framework: 'SCIIP_PHASE1_SPRINT4_EXECUTIVE_ENGINE_SIGNAL_INTEGRATION', status: 'PASSED', testsRun, result: { ...integration.snapshot(), existingExecutiveApisPreserved: true, decisionTraceability: true, boundedHistory: true } }, null, 2));

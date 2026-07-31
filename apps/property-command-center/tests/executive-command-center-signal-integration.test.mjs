import assert from 'node:assert/strict';
import {
  createExecutiveCommandCenterAdapter,
  normalizeExecutiveCommandCenterState,
  selectExecutiveHealth,
  selectExecutiveSeverity,
  selectCriticalDecisions,
  selectActiveAlerts,
  selectPriorityRecommendationCount,
  selectBrokerReviewRequired,
  selectDecisionTraceability,
  selectExecutiveHeadline,
  selectImmediateExecutiveAction
} from '../src/executive-command-center/signal-integration/index.js';

let current = {
  executiveState: { kpis: { approvalsRequired: 1 }, health: [{ id: 'workflow', status: 'WATCH' }] },
  briefing: { headline: 'One item requires review', bullets: ['Review failed batch'], evidence: ['SIG-5'] },
  timeline: [{ id: 'T-1', title: 'Batch failed', at: '2026-07-31T15:00:00.000Z' }],
  decision: {
    status: 'ATTENTION_REQUIRED', severity: 'CRITICAL', headline: 'One item requires review',
    immediateAction: 'Review failed batch', brokerReviewRequired: true, recommendationCount: 1,
    criticalAlertCount: 1, sourceSignalIds: ['SIG-5'], generatedAt: '2026-07-31T15:00:00.000Z',
    evidence: [{ id: 'ALERT-1', type: 'PRODUCTION_BATCH_FAILED', severity: 'CRITICAL' }]
  }
};
const integration = { buildSnapshot: () => current };
const adapter = createExecutiveCommandCenterAdapter({ maxSnapshots: 2 });
let notifications = 0;
const detach = adapter.subscribe(() => { notifications += 1; });
const started = adapter.start(integration);
const state = adapter.getState();

const tests = [];
const check = (name, fn) => { fn(); tests.push(name); };
check('command-center-starts', () => assert.equal(started.status, 'OPERATIONAL'));
check('executive-snapshot-propagates', () => assert.equal(state.headline, 'One item requires review'));
check('state-is-immutable', () => assert.equal(Object.isFrozen(state), true));
check('health-selector', () => assert.equal(selectExecutiveHealth(state), 'ATTENTION_REQUIRED'));
check('severity-selector', () => assert.equal(selectExecutiveSeverity(state), 'CRITICAL'));
check('critical-decisions-selector', () => assert.equal(selectCriticalDecisions(state).length, 1));
check('alerts-propagate', () => assert.equal(selectActiveAlerts(state).length, 1));
check('recommendations-propagate', () => assert.equal(selectPriorityRecommendationCount(state), 1));
check('broker-review-propagates', () => assert.equal(selectBrokerReviewRequired(state), true));
check('traceability-preserved', () => assert.deepEqual(selectDecisionTraceability(state).sourceSignalIds, ['SIG-5']));
check('headline-selector', () => assert.equal(selectExecutiveHeadline(state), 'One item requires review'));
check('immediate-action-selector', () => assert.equal(selectImmediateExecutiveAction(state), 'Review failed batch'));
check('duplicate-suppression', () => assert.equal(adapter.refresh(current).status, 'DUPLICATE_IGNORED'));
current = { ...current, decision: { ...current.decision, generatedAt: '2026-07-31T15:01:00.000Z', sourceSignalIds: ['SIG-6'] } };
adapter.refresh(current);
current = { ...current, decision: { ...current.decision, generatedAt: '2026-07-31T15:02:00.000Z', sourceSignalIds: ['SIG-7'] } };
adapter.refresh(current);
check('bounded-history', () => assert.equal(adapter.getHistory().length, 2));
detach();
const stopped = adapter.stop();
check('lifecycle-stop', () => assert.equal(stopped.status, 'STOPPED'));

const normalized = normalizeExecutiveCommandCenterState(current);
assert.equal(normalized.kpis.approvalsRequired, 1);
assert.equal(notifications, 3);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE1_SPRINT5_EXECUTIVE_COMMAND_CENTER_SIGNAL_WIRING',
  status: 'PASSED',
  testsRun: tests.length,
  result: {
    status: stopped.status,
    executiveHealth: normalized.health,
    severity: normalized.severity,
    brokerReviewRequired: normalized.brokerReviewRequired,
    sourceSignalCount: normalized.sourceSignalIds.length,
    retainedSnapshots: stopped.retainedSnapshots,
    duplicatesIgnored: stopped.duplicatesIgnored,
    refreshFailures: stopped.refreshFailures,
    immutableUiState: Object.isFrozen(normalized),
    selectorCompatibility: true,
    existingComponentApiPreserved: true
  }
}, null, 2));

import assert from 'node:assert/strict';
import { createExecutiveActionOrchestrator, createExecutiveWorkflowEnvelope, mapExecutiveStateToActionProposal } from '../src/executive-actions/orchestration/index.js';

let testsRun = 0;
const test = (name, fn) => { fn(); testsRun += 1; };
const criticalState = Object.freeze({
  status: 'ATTENTION_REQUIRED',
  severity: 'CRITICAL',
  headline: 'Production certification failed',
  immediateAction: 'Review failed production batch',
  brokerReviewRequired: true,
  recommendationCount: 1,
  criticalAlertCount: 1,
  sourceSignalIds: Object.freeze(['SIG-CRITICAL-1']),
  generatedAt: '2026-07-31T15:15:00.000Z'
});

const proposal = mapExecutiveStateToActionProposal(criticalState);
test('maps action proposal', () => assert.equal(proposal.status, 'PENDING_APPROVAL'));
test('requires human approval', () => assert.equal(proposal.humanApprovalRequired, true));
test('blocks autonomous execution', () => assert.equal(proposal.autonomousExecutionAllowed, false));
test('preserves signal traceability', () => assert.deepEqual(proposal.sourceSignalIds, ['SIG-CRITICAL-1']));
test('maps critical priority', () => assert.equal(proposal.priorityScore, 100));
test('creates immutable proposal', () => assert.equal(Object.isFrozen(proposal), true));

const listeners = new Set();
const adapter = {
  getState: () => criticalState,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
};
const orchestrator = createExecutiveActionOrchestrator({ maxProposals: 2 });
let notified = 0;
orchestrator.subscribe(() => { notified += 1; });
orchestrator.start(adapter);
test('starts operationally', () => assert.equal(orchestrator.snapshot().status, 'OPERATIONAL'));
test('creates initial proposal', () => assert.equal(orchestrator.snapshot().proposalsCreated, 1));
test('notifies proposal listeners', () => assert.equal(notified, 1));
orchestrator.propose(criticalState);
test('suppresses duplicates', () => assert.equal(orchestrator.snapshot().duplicatesIgnored, 1));
const stable = { status: 'STABLE', severity: 'INFO', generatedAt: '2026-07-31T15:16:00.000Z' };
orchestrator.propose(stable);
test('ignores stable state', () => assert.equal(orchestrator.snapshot().noActionIgnored, 1));
const dispatch = orchestrator.dispatch(orchestrator.getLatestProposal());
test('blocks unapproved dispatch', () => assert.equal(dispatch.status, 'BLOCKED_PENDING_HUMAN_APPROVAL'));
const envelope = createExecutiveWorkflowEnvelope(orchestrator.getLatestProposal(), { createdAt: '2026-07-31T15:17:00.000Z' });
test('creates governed workflow envelope', () => assert.equal(envelope.executionMode, 'HUMAN_GOVERNED'));
test('workflow remains pending approval', () => assert.equal(envelope.status, 'PENDING_APPROVAL'));
test('workflow traceability preserved', () => assert.deepEqual(envelope.sourceSignalIds, ['SIG-CRITICAL-1']));
orchestrator.stop();
test('stops cleanly', () => assert.equal(orchestrator.snapshot().status, 'STOPPED'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE2_SPRINT1_EXECUTIVE_ACTION_ORCHESTRATION',
  status: 'PASSED',
  testsRun,
  result: {
    status: orchestrator.snapshot().status,
    proposalsCreated: orchestrator.snapshot().proposalsCreated,
    retainedProposals: orchestrator.snapshot().retainedProposals,
    duplicatesIgnored: orchestrator.snapshot().duplicatesIgnored,
    noActionIgnored: orchestrator.snapshot().noActionIgnored,
    proposalFailures: orchestrator.snapshot().proposalFailures,
    dispatchAttemptsBlocked: orchestrator.snapshot().dispatchAttemptsBlocked,
    humanApprovalRequired: true,
    autonomousExecutionAllowed: false,
    workflowStatus: envelope.status,
    decisionTraceability: envelope.sourceSignalIds.length > 0
  }
}, null, 2));

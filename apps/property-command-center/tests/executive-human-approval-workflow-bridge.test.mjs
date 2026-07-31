import assert from 'node:assert/strict';
import { createExecutiveApprovalLedger, createExecutiveApprovalRecord, createExecutiveApprovalWorkflowBridge } from '../src/executive-actions/approval/index.js';

let testsRun = 0;
const test = async (name, fn) => { await fn(); testsRun += 1; };
const proposal = Object.freeze({
  proposalId: 'EXEC-ACTION:CRITICAL:001',
  status: 'PENDING_APPROVAL',
  action: 'Review failed production batch',
  severity: 'CRITICAL',
  priorityScore: 100,
  brokerReviewRequired: true,
  sourceSignalIds: Object.freeze(['SIG-CRITICAL-1']),
  createdAt: '2026-07-31T15:30:00.000Z'
});

const record = createExecutiveApprovalRecord(proposal, { outcome: 'APPROVED', decidedBy: 'USER-001', reason: 'Evidence reviewed and escalation is required' }, { decidedAt: '2026-07-31T15:31:00.000Z' });
await test('creates approval record', () => assert.equal(record.outcome, 'APPROVED'));
await test('requires human actor', () => assert.equal(record.decidedBy, 'USER-001'));
await test('preserves traceability', () => assert.deepEqual(record.sourceSignalIds, ['SIG-CRITICAL-1']));
await test('blocks autonomous decisions', () => assert.equal(record.autonomousDecisionAllowed, false));
await test('creates immutable record', () => assert.equal(Object.isFrozen(record), true));

const ledger = createExecutiveApprovalLedger({ maxRecords: 2 });
const approved = ledger.approve(proposal, { decidedBy: 'USER-001', reason: 'Approved after evidence review' }, { decidedAt: '2026-07-31T15:31:00.000Z' });
await test('records approval', () => assert.equal(approved.status, 'APPROVED'));
await test('reports approved proposal', () => assert.equal(ledger.isApproved(proposal.proposalId), true));
const duplicate = ledger.approve(proposal, { decidedBy: 'USER-001', reason: 'Approved after evidence review' });
await test('suppresses duplicate decision', () => assert.equal(duplicate.status, 'DUPLICATE_IGNORED'));
const conflict = ledger.reject(proposal, { decidedBy: 'USER-002', reason: 'Conflicting rejection' });
await test('blocks conflicting decision', () => assert.equal(conflict.status, 'CONFLICT_BLOCKED'));
const invalid = ledger.approve(proposal, { decidedBy: '', reason: '' });
await test('blocks invalid decision', () => assert.equal(invalid.status, 'INVALID_DECISION_BLOCKED'));

const submitted = [];
const workflowEngine = { submit: async envelope => { submitted.push(envelope); return { workflowId: 'WF-001', status: 'QUEUED' }; } };
const bridge = createExecutiveApprovalWorkflowBridge({ maxSubmissions: 2 });
bridge.start(ledger, workflowEngine);
await test('starts bridge operationally', () => assert.equal(bridge.snapshot().status, 'OPERATIONAL'));
const unapprovedProposal = { ...proposal, proposalId: 'EXEC-ACTION:HIGH:002' };
const blocked = await bridge.submitApproved(unapprovedProposal);
await test('blocks unapproved dispatch', () => assert.equal(blocked.status, 'BLOCKED_PENDING_HUMAN_APPROVAL'));
const result = await bridge.submitApproved(proposal, { submittedAt: '2026-07-31T15:32:00.000Z' });
await test('submits approved workflow', () => assert.equal(result.status, 'SUBMITTED_TO_WORKFLOW_ENGINE'));
await test('attaches approval evidence', () => assert.equal(result.envelope.approvalId, approved.record.approvalId));
await test('preserves human governance', () => assert.equal(result.envelope.autonomousExecutionAllowed, false));
await test('preserves source signals', () => assert.deepEqual(result.envelope.sourceSignalIds, ['SIG-CRITICAL-1']));
await test('invokes workflow engine once', () => assert.equal(submitted.length, 1));
const duplicateSubmission = await bridge.submitApproved(proposal);
await test('suppresses duplicate submission', () => assert.equal(duplicateSubmission.status, 'DUPLICATE_IGNORED'));
bridge.stop();
await test('stops bridge cleanly', () => assert.equal(bridge.snapshot().status, 'STOPPED'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE2_SPRINT2_HUMAN_APPROVAL_WORKFLOW_BRIDGE',
  status: 'PASSED',
  testsRun,
  result: {
    status: bridge.snapshot().status,
    decisionsRecorded: ledger.snapshot().decisionsRecorded,
    duplicateDecisionsIgnored: ledger.snapshot().duplicateDecisionsIgnored,
    conflictingDecisionsBlocked: ledger.snapshot().conflictingDecisionsBlocked,
    invalidDecisionsBlocked: ledger.snapshot().invalidDecisionsBlocked,
    approvedSubmissions: bridge.snapshot().approvedSubmissions,
    unauthorizedDispatchesBlocked: bridge.snapshot().unauthorizedDispatchesBlocked,
    duplicateSubmissionsIgnored: bridge.snapshot().duplicatesIgnored,
    submissionFailures: bridge.snapshot().submissionFailures,
    workflowStatus: result.status,
    humanApprovalRequired: true,
    autonomousExecutionAllowed: false,
    decisionTraceability: result.envelope.sourceSignalIds.length > 0
  }
}, null, 2));

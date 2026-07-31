import { createExecutiveWorkflowEnvelope } from '../orchestration/executiveWorkflowEnvelope.js';

const callWorkflowEngine = async (workflowEngine, envelope) => {
  if (typeof workflowEngine.submit === 'function') return workflowEngine.submit(envelope);
  if (typeof workflowEngine.enqueue === 'function') return workflowEngine.enqueue(envelope);
  if (typeof workflowEngine.createWorkflow === 'function') return workflowEngine.createWorkflow(envelope);
  throw new Error('Workflow Engine must expose submit, enqueue, or createWorkflow');
};

export function createExecutiveApprovalWorkflowBridge(options = {}) {
  const maxSubmissions = Math.max(1, Number(options.maxSubmissions || 200));
  const submissions = [];
  const submittedProposalIds = new Set();
  let approvalLedger = null;
  let workflowEngine = null;
  let startedAt = null;
  let approvedSubmissions = 0;
  let unauthorizedDispatchesBlocked = 0;
  let rejectedDispatchesBlocked = 0;
  let duplicatesIgnored = 0;
  let submissionFailures = 0;

  const submitApproved = async (proposal, submitOptions = {}) => {
    if (!proposal?.proposalId) {
      submissionFailures += 1;
      return Object.freeze({ status: 'SUBMISSION_FAILED', message: 'Executive action proposal is required' });
    }
    const approval = approvalLedger?.getByProposalId(proposal.proposalId);
    if (!approval) {
      unauthorizedDispatchesBlocked += 1;
      return Object.freeze({ status: 'BLOCKED_PENDING_HUMAN_APPROVAL', workflow: null });
    }
    if (approval.outcome !== 'APPROVED') {
      rejectedDispatchesBlocked += 1;
      return Object.freeze({ status: 'BLOCKED_REJECTED', approval, workflow: null });
    }
    if (submittedProposalIds.has(proposal.proposalId)) {
      duplicatesIgnored += 1;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', approval, workflow: submissions.find(item => item.proposalId === proposal.proposalId) || null });
    }
    try {
      const baseEnvelope = createExecutiveWorkflowEnvelope(proposal, submitOptions);
      const envelope = Object.freeze({
        ...baseEnvelope,
        status: 'APPROVED_FOR_WORKFLOW',
        approvalStatus: 'APPROVED',
        approvalId: approval.approvalId,
        approvedBy: approval.decidedBy,
        approvedAt: approval.decidedAt,
        approvalReason: approval.reason,
        executionAuthorized: true,
        autonomousExecutionAllowed: false
      });
      const engineResult = await callWorkflowEngine(workflowEngine, envelope);
      const submission = Object.freeze({
        proposalId: proposal.proposalId,
        workflowRequestId: envelope.workflowRequestId,
        status: 'SUBMITTED_TO_WORKFLOW_ENGINE',
        envelope,
        engineResult: engineResult ?? null,
        submittedAt: submitOptions.submittedAt || new Date().toISOString()
      });
      submittedProposalIds.add(proposal.proposalId);
      submissions.push(submission);
      while (submissions.length > maxSubmissions) submissions.shift();
      approvedSubmissions += 1;
      return submission;
    } catch (error) {
      submissionFailures += 1;
      return Object.freeze({ status: 'SUBMISSION_FAILED', message: error.message, workflow: null });
    }
  };

  return Object.freeze({
    start(nextApprovalLedger, nextWorkflowEngine) {
      if (!nextApprovalLedger || typeof nextApprovalLedger.getByProposalId !== 'function') throw new Error('Executive Approval Ledger is required');
      if (!nextWorkflowEngine) throw new Error('Workflow Engine is required');
      approvalLedger = nextApprovalLedger;
      workflowEngine = nextWorkflowEngine;
      startedAt ||= new Date().toISOString();
      return this.snapshot();
    },
    stop() {
      approvalLedger = null;
      workflowEngine = null;
      return this.snapshot();
    },
    submitApproved,
    getSubmissions: () => Object.freeze([...submissions]),
    getLatestSubmission: () => submissions.at(-1) || null,
    snapshot() {
      return Object.freeze({
        status: approvalLedger && workflowEngine ? 'OPERATIONAL' : startedAt ? 'STOPPED' : 'READY',
        startedAt,
        approvedSubmissions,
        retainedSubmissions: submissions.length,
        maxSubmissions,
        unauthorizedDispatchesBlocked,
        rejectedDispatchesBlocked,
        duplicatesIgnored,
        submissionFailures,
        humanApprovalRequired: true,
        autonomousExecutionAllowed: false
      });
    }
  });
}

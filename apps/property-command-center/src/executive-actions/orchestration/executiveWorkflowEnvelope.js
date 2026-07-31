export function createExecutiveWorkflowEnvelope(proposal = {}, options = {}) {
  if (!proposal.proposalId) throw new Error('Executive action proposal is required');
  return Object.freeze({
    workflowRequestId: options.workflowRequestId || `WF:${proposal.proposalId}`,
    workflowType: 'EXECUTIVE_REVIEW',
    status: 'PENDING_APPROVAL',
    approvalRequired: true,
    executionMode: 'HUMAN_GOVERNED',
    action: proposal.action || null,
    severity: proposal.severity || 'INFO',
    priorityScore: Number(proposal.priorityScore || 0),
    brokerReviewRequired: Boolean(proposal.brokerReviewRequired),
    sourceSignalIds: Object.freeze([...(proposal.sourceSignalIds || [])]),
    proposalId: proposal.proposalId,
    createdAt: options.createdAt || proposal.createdAt || new Date().toISOString()
  });
}

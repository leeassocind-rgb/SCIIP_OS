const DECISIONS = new Set(['APPROVED', 'REJECTED']);

const freezeArray = value => Object.freeze(Array.isArray(value) ? [...value] : []);

export function createExecutiveApprovalRecord(proposal = {}, decision = {}, options = {}) {
  if (!proposal.proposalId) throw new Error('Executive action proposal is required');
  const outcome = String(decision.outcome || decision.status || '').toUpperCase();
  if (!DECISIONS.has(outcome)) throw new Error('Approval outcome must be APPROVED or REJECTED');
  const decidedBy = String(decision.decidedBy || decision.actorId || '').trim();
  if (!decidedBy) throw new Error('Approval decision requires an identified human actor');
  const reason = String(decision.reason || '').trim();
  if (!reason) throw new Error('Approval decision requires a reason');
  const decidedAt = options.decidedAt || decision.decidedAt || new Date().toISOString();

  return Object.freeze({
    approvalId: options.approvalId || `APPROVAL:${proposal.proposalId}`,
    type: 'EXECUTIVE_ACTION_APPROVAL',
    proposalId: proposal.proposalId,
    outcome,
    status: outcome,
    decidedBy,
    reason,
    decidedAt,
    humanDecision: true,
    autonomousDecisionAllowed: false,
    sourceSignalIds: freezeArray(proposal.sourceSignalIds),
    traceable: Boolean(proposal.proposalId) && (proposal.sourceSignalIds || []).length > 0,
    metadata: Object.freeze({
      severity: proposal.severity || 'INFO',
      priorityScore: Number(proposal.priorityScore || 0),
      brokerReviewRequired: Boolean(proposal.brokerReviewRequired)
    })
  });
}

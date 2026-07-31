const freeze = value => Object.freeze(value);
export function createExecutiveOutcomeViewModel(summary = {}) {
  const classification = summary.classification || 'UNKNOWN';
  const requiresReview = Boolean(summary.requiresReview || ['FAILED','CANCELLED','PARTIALLY_COMPLETED'].includes(classification));
  return freeze({
    id: summary.outcomeId || `OUTCOME:${summary.workflowRequestId || 'UNKNOWN'}`,
    workflowRequestId: summary.workflowRequestId || null,
    workflowId: summary.workflowId || null,
    proposalId: summary.proposalId || null,
    approvalId: summary.approvalId || null,
    sourceSignalIds: freeze([...(summary.sourceSignalIds || [])]),
    classification,
    severity: requiresReview ? 'ATTENTION' : classification === 'COMPLETED' ? 'INFO' : 'WATCH',
    requiresReview,
    durationMs: Number(summary.durationMs || 0),
    evidenceCount: Number(summary.evidenceCount || 0),
    completedAt: summary.completedAt || summary.endedAt || null,
    headline: summary.headline || `${classification.replaceAll('_',' ')} workflow outcome`,
    workflowMutationAllowed: false,
    autonomousExecutionAllowed: false,
    decisionTraceability: true
  });
}

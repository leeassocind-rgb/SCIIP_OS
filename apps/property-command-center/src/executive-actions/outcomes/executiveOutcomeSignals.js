export function createExecutiveOutcomeSignal(summary = {}) {
  const classification = String(summary.classification || 'IN_PROGRESS').toUpperCase();
  const severity = classification === 'FAILED' ? 'CRITICAL' : classification === 'CANCELLED' || classification === 'PARTIALLY_COMPLETED' ? 'WARNING' : classification === 'COMPLETED' ? 'INFO' : 'NOTICE';
  return Object.freeze({
    signalId: `OUTCOME-SIGNAL:${summary.outcomeId || summary.workflowRequestId || 'UNKNOWN'}`,
    signalType: 'EXECUTIVE_EXECUTION_OUTCOME',
    severity,
    classification,
    executiveReviewRequired: classification !== 'COMPLETED',
    workflowRequestId: summary.workflowRequestId || null,
    proposalId: summary.proposalId || null,
    approvalId: summary.approvalId || null,
    sourceSignalIds: Object.freeze([...(summary.sourceSignalIds || [])]),
    autonomousExecutionAllowed: false,
    generatedAt: summary.generatedAt || new Date().toISOString()
  });
}

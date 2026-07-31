const SEVERITY_PRIORITY = Object.freeze({ CRITICAL: 100, HIGH: 80, MEDIUM: 50, LOW: 20, INFO: 0 });

const freezeArray = value => Object.freeze(Array.isArray(value) ? [...value] : []);

export function mapExecutiveStateToActionProposal(state = {}, options = {}) {
  const severity = String(state.severity || 'INFO').toUpperCase();
  const sourceSignalIds = freezeArray(state.sourceSignalIds);
  const action = state.immediateAction || null;
  const requiresAction = state.status === 'ATTENTION_REQUIRED' && Boolean(action);
  const proposalId = options.proposalId || [
    'EXEC-ACTION',
    severity,
    state.generatedAt || 'UNSPECIFIED',
    sourceSignalIds.join('.') || 'NO-SIGNAL'
  ].join(':');

  return Object.freeze({
    proposalId,
    type: 'EXECUTIVE_ACTION_PROPOSAL',
    status: requiresAction ? 'PENDING_APPROVAL' : 'NO_ACTION_REQUIRED',
    action,
    headline: state.headline || 'Executive operations are stable',
    severity,
    priorityScore: SEVERITY_PRIORITY[severity] ?? 0,
    brokerReviewRequired: Boolean(state.brokerReviewRequired),
    humanApprovalRequired: true,
    autonomousExecutionAllowed: false,
    sourceSignalIds,
    traceable: sourceSignalIds.length > 0,
    createdAt: options.createdAt || state.generatedAt || new Date().toISOString(),
    metadata: Object.freeze({
      recommendationCount: Number(state.recommendationCount || 0),
      criticalAlertCount: Number(state.criticalAlertCount || 0)
    })
  });
}

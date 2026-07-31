const HIGH_SEVERITY = new Set(['HIGH', 'CRITICAL']);

export function mapExecutiveSignalToInsightInput(signal) {
  if (!signal || typeof signal !== 'object') throw new Error('Executive signal is required');

  const base = Object.freeze({
    id: signal.id,
    type: signal.type,
    source: signal.source,
    severity: signal.severity,
    occurredAt: signal.occurredAt,
    propertyId: signal.propertyId || null,
    assignmentId: signal.assignmentId || null,
    payload: signal.payload || {},
    metadata: signal.metadata || {}
  });

  const alerts = HIGH_SEVERITY.has(signal.severity)
    ? [Object.freeze({
        ...base,
        title: signal.metadata?.title || signal.type.replaceAll('_', ' '),
        message: signal.metadata?.message || `Executive signal ${signal.type} requires attention.`
      })]
    : [];

  const consequential = Boolean(signal.metadata?.consequential) || HIGH_SEVERITY.has(signal.severity);
  const recommendations = consequential
    ? [Object.freeze({
        id: `recommendation:${signal.id}`,
        signalId: signal.id,
        type: signal.type,
        source: signal.source,
        confidenceBand: signal.metadata?.confidenceBand || (signal.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM'),
        consequential,
        approvalRequired: Boolean(signal.metadata?.approvalRequired) || signal.type.endsWith('_REVIEW_REQUIRED'),
        action: signal.metadata?.recommendedAction || `Review ${signal.type.replaceAll('_', ' ').toLowerCase()}`,
        propertyId: signal.propertyId || null,
        assignmentId: signal.assignmentId || null,
        evidence: [base]
      })]
    : [];

  return Object.freeze({ recommendations, correlations: [], alerts });
}

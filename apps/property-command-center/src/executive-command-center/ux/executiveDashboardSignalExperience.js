const freezeArray = value => Object.freeze(Array.isArray(value) ? [...value] : []);

const domainLabels = Object.freeze({
  'market-intelligence': 'Market Intelligence',
  'enterprise-knowledge-graph': 'Knowledge Graph',
  'property-digital-twin': 'Property Digital Twin',
  gis: 'GIS',
  'document-intelligence': 'Document Intelligence',
  'executive-ai': 'Executive AI',
  'workflow-engine': 'Workflow Engine'
});

export function createExecutiveDashboardSignalExperience({
  legacySnapshot = {},
  signalState = {},
  signalRuntime = {}
} = {}) {
  const kpis = legacySnapshot.kpis || {};
  const workspaceHealth = legacySnapshot.health || [];
  const activeAlerts = freezeArray(signalState.alerts);
  const sourceSignalIds = freezeArray(signalState.sourceSignalIds);
  const registeredTypes = freezeArray(signalRuntime.registeredTypes);
  const domains = Object.entries(domainLabels).map(([id, label]) => {
    const active = registeredTypes.some(item => {
      const source = String(item?.source || '').toLowerCase();
      return source === id || (id === 'gis' && source === 'gis');
    });
    return Object.freeze({ id, label, status: active ? 'INTEGRATED' : 'READY' });
  });

  const severity = String(signalState.severity || 'INFO').toUpperCase();
  const reviewRequired = Boolean(
    signalState.brokerReviewRequired ||
    signalState.status === 'ATTENTION_REQUIRED' ||
    activeAlerts.length
  );

  return Object.freeze({
    health: signalState.health || 'OPERATIONAL',
    severity,
    headline: signalState.headline || 'Executive operations are stable',
    reviewRequired,
    immediateAction: signalState.immediateAction || null,
    recommendationCount: Number(signalState.recommendationCount || 0),
    activeAlertCount: activeAlerts.length,
    sourceSignalCount: sourceSignalIds.length,
    sourceSignalIds,
    traceable: Boolean(signalState.traceable || sourceSignalIds.length),
    domains: Object.freeze(domains),
    integratedDomainCount: domains.filter(item => item.status === 'INTEGRATED').length,
    kpis: Object.freeze({
      propertiesUnderReview: Number(kpis.propertiesUnderReview || 0),
      highConfidenceOpportunities: Number(kpis.highConfidenceOpportunities || 0),
      approvalsRequired: Number(kpis.approvalsRequired || 0),
      workflowCompletion: Number(kpis.workflowCompletion || 0),
      averageOpportunityScore: Number(kpis.averageOpportunityScore || 0),
      evidenceFreshness: Number(kpis.evidenceFreshness || 0)
    }),
    workspaceHealth: freezeArray(workspaceHealth),
    alerts: activeAlerts,
    generatedAt: signalState.generatedAt || new Date().toISOString(),
    executionAuthorized: false,
    autonomousExecutionAllowed: false
  });
}

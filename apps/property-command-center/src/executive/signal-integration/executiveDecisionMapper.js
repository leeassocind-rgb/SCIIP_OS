const severityRank = Object.freeze({ CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 });

function rankSeverity(value) {
  return severityRank[String(value || 'INFO').toUpperCase()] ?? 0;
}

export function mapInsightsToExecutiveDecision(insights = {}) {
  const recommendations = Array.isArray(insights.priorityRecommendations) ? insights.priorityRecommendations : [];
  const alerts = Array.isArray(insights.criticalAlerts) ? insights.criticalAlerts : [];
  const sourceSignalIds = Array.isArray(insights.sourceSignalIds) ? insights.sourceSignalIds : [];

  const topAlert = [...alerts].sort((a, b) => rankSeverity(b.severity) - rankSeverity(a.severity))[0] || null;
  const topRecommendation = recommendations[0] || null;
  const brokerReviewRequired = Boolean(insights.brokerReviewRequired || recommendations.some(item => item.approvalRequired));
  const severity = topAlert?.severity || (brokerReviewRequired ? 'HIGH' : recommendations.length ? 'MEDIUM' : 'INFO');
  const immediateAction = topRecommendation?.action || (topAlert ? `Review ${topAlert.type || 'critical alert'}` : null);

  return Object.freeze({
    status: alerts.length || recommendations.length ? 'ATTENTION_REQUIRED' : 'STABLE',
    severity,
    headline: insights.headline || 'No priority intelligence items require review',
    brokerReviewRequired,
    immediateAction,
    recommendationCount: recommendations.length,
    criticalAlertCount: alerts.length,
    sourceSignalIds: Object.freeze([...sourceSignalIds]),
    evidence: Object.freeze([
      ...recommendations.flatMap(item => Array.isArray(item.evidence) ? item.evidence : []),
      ...alerts
    ]),
    generatedAt: insights.generatedAt || new Date().toISOString()
  });
}

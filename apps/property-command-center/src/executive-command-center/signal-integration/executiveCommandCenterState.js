const severityRank = Object.freeze({ CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 });

const freezeArray = value => Object.freeze(Array.isArray(value) ? [...value] : []);

export function normalizeExecutiveCommandCenterState(engineSnapshot = {}) {
  const decision = engineSnapshot.decision || {};
  const executiveState = engineSnapshot.executiveState || {};
  const briefing = engineSnapshot.briefing || {};
  const timeline = Array.isArray(engineSnapshot.timeline) ? engineSnapshot.timeline : [];
  const alerts = Array.isArray(decision.evidence)
    ? decision.evidence.filter(item => item && (item.severity || item.type))
    : [];

  return Object.freeze({
    status: decision.status || 'STABLE',
    health: decision.status === 'ATTENTION_REQUIRED' ? 'ATTENTION_REQUIRED' : 'OPERATIONAL',
    severity: String(decision.severity || 'INFO').toUpperCase(),
    severityRank: severityRank[String(decision.severity || 'INFO').toUpperCase()] ?? 0,
    headline: decision.headline || briefing.headline || 'Executive operations are stable',
    immediateAction: decision.immediateAction || null,
    brokerReviewRequired: Boolean(decision.brokerReviewRequired),
    recommendationCount: Number(decision.recommendationCount || 0),
    criticalAlertCount: Number(decision.criticalAlertCount || alerts.length || 0),
    sourceSignalIds: freezeArray(decision.sourceSignalIds),
    alerts: freezeArray(alerts),
    briefing: Object.freeze({
      headline: briefing.headline || decision.headline || 'Executive operations are stable',
      bullets: freezeArray(briefing.bullets),
      evidence: freezeArray(briefing.evidence)
    }),
    kpis: Object.freeze({ ...(executiveState.kpis || {}) }),
    workspaceHealth: freezeArray(executiveState.health),
    timeline: freezeArray(timeline),
    generatedAt: decision.generatedAt || new Date().toISOString(),
    traceable: Array.isArray(decision.sourceSignalIds) && decision.sourceSignalIds.length > 0
  });
}

export function createEmptyExecutiveCommandCenterState() {
  return normalizeExecutiveCommandCenterState();
}

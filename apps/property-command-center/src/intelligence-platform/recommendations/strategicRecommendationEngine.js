const freeze = value => Object.freeze(value);

export function generateStrategicRecommendations({ opportunities = [], risks = [], evidence = [] } = {}) {
  const evidenceMap = new Map();
  for (const item of evidence) {
    if (!evidenceMap.has(item.subjectId)) evidenceMap.set(item.subjectId, []);
    evidenceMap.get(item.subjectId).push(item);
  }

  const recommendations = opportunities.map((opportunity, index) => {
    const linked = evidenceMap.get(opportunity.subjectId) || [];
    const matchingRisk = risks.find(risk => risk.subjectId === opportunity.subjectId);
    const score = Number((
      Number(opportunity.opportunityScore || 0) -
      Number(matchingRisk?.riskScore || 0) +
      linked.length * 5
    ).toFixed(2));

    return freeze({
      recommendationId: `STRAT-${String(index + 1).padStart(4, '0')}`,
      subjectId: opportunity.subjectId,
      action: opportunity.action || 'REVIEW',
      score,
      evidenceCount: linked.length,
      riskAdjusted: Boolean(matchingRisk),
      status: linked.length ? 'RECOMMENDED' : 'INSUFFICIENT_EVIDENCE',
      approvalRequired: true,
      autonomousExecutionAllowed: false
    });
  }).sort((a, b) => b.score - a.score);

  return freeze({
    recommendations: freeze(recommendations),
    total: recommendations.length,
    recommended: recommendations.filter(item => item.status === 'RECOMMENDED').length,
    topRecommendation: recommendations[0] || null,
    evidenceRequired: true,
    approvalRequired: true,
    autonomousExecutionAllowed: false
  });
}

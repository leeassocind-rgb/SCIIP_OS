const freeze = value => Object.freeze(value);

export function aggregateEnterpriseRisk({risks=[],thresholds={high:70,critical:90}}={}) {
  const normalized = risks.map(risk => {
    const likelihood = Number(risk.likelihood || 0);
    const impact = Number(risk.impact || 0);
    const velocity = Number(risk.velocity || 0);
    const score = Number((likelihood * .35 + impact * .45 + velocity * .20).toFixed(2));
    const severity = score >= thresholds.critical ? 'CRITICAL'
      : score >= thresholds.high ? 'HIGH'
      : score >= 40 ? 'MODERATE'
      : 'LOW';

    return freeze({
      ...risk,
      score,
      severity,
      evidenceRequired:true,
      executiveReviewRequired:severity === 'HIGH' || severity === 'CRITICAL'
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    risks:freeze(normalized),
    total:normalized.length,
    highOrCritical:normalized.filter(r=>['HIGH','CRITICAL'].includes(r.severity)).length,
    topRisk:normalized[0]||null,
    crossDomain:true,
    evidenceBacked:true,
    permanentHistory:true,
    autonomousMitigationAllowed:false
  });
}

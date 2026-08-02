const freeze = value => Object.freeze(value);

export function evaluateDealRequirementDecision({
  decisionId,
  alternatives = [],
  weights = { fit:.35, economics:.25, timing:.15, risk:.15, relationship:.10 }
} = {}) {
  if (!decisionId) throw new Error('decisionId is required');

  const evaluated = alternatives.map(alternative => {
    const dimensions = alternative.dimensions || {};
    const score = Number((
      Number(dimensions.fit || 0) * Number(weights.fit || 0) +
      Number(dimensions.economics || 0) * Number(weights.economics || 0) +
      Number(dimensions.timing || 0) * Number(weights.timing || 0) +
      (100 - Number(dimensions.risk || 0)) * Number(weights.risk || 0) +
      Number(dimensions.relationship || 0) * Number(weights.relationship || 0)
    ).toFixed(2));

    return freeze({
      alternativeId: alternative.alternativeId,
      label: alternative.label,
      score,
      evidenceCount: Number(alternative.evidenceCount || 0),
      status: alternative.evidenceCount ? 'EVALUATED' : 'INSUFFICIENT_EVIDENCE',
      approvalRequired: true,
      autonomousCommitmentAllowed: false
    });
  }).sort((a,b) => b.score - a.score);

  return freeze({
    decisionId,
    alternatives: freeze(evaluated),
    total: evaluated.length,
    topAlternative: evaluated[0] || null,
    explainable: true,
    evidenceRequired: true,
    approvalRequired: true,
    autonomousCommitmentAllowed: false
  });
}

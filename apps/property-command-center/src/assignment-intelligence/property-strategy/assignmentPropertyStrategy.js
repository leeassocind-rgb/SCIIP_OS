const freeze = value => Object.freeze(value);

export function evaluateAssignmentPropertyStrategy({assignmentId,properties=[],constraints={}}={}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const evaluated = properties.map(property => {
    const opportunity = Number(property.opportunityScore || 0);
    const risk = Number(property.riskScore || 0);
    const evidence = Number(property.evidenceCount || 0);
    const executionFit = Number(property.executionFit || 0);
    const score = Number((opportunity + executionFit + evidence * 3 - risk).toFixed(2));
    const eligible =
      (!constraints.minimumEvidence || evidence >= constraints.minimumEvidence) &&
      (!constraints.maximumRisk || risk <= constraints.maximumRisk);

    return freeze({
      ...property,
      score,
      eligible,
      status: eligible ? 'STRATEGIC_CANDIDATE' : 'CONSTRAINED'
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    assignmentId,
    properties: freeze(evaluated),
    candidates: freeze(evaluated.filter(item=>item.eligible)),
    candidateCount: evaluated.filter(item=>item.eligible).length,
    topCandidate: evaluated.find(item=>item.eligible) || null,
    constraintsApplied: true,
    evidenceRequired: true,
    approvalRequired: true,
    autonomousExecutionAllowed: false
  });
}

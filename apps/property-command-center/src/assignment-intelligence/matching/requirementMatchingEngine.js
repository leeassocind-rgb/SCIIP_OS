const freeze = value => Object.freeze(value);

export function matchRequirements({requirement={},properties=[]}={}) {
  const weights = {
    size: Number(requirement.weights?.size ?? .25),
    location: Number(requirement.weights?.location ?? .20),
    power: Number(requirement.weights?.power ?? .20),
    clearHeight: Number(requirement.weights?.clearHeight ?? .15),
    timing: Number(requirement.weights?.timing ?? .10),
    economics: Number(requirement.weights?.economics ?? .10)
  };

  const scored = properties.map(property => {
    const dimensions = {
      size: Number(property.scores?.size || 0),
      location: Number(property.scores?.location || 0),
      power: Number(property.scores?.power || 0),
      clearHeight: Number(property.scores?.clearHeight || 0),
      timing: Number(property.scores?.timing || 0),
      economics: Number(property.scores?.economics || 0)
    };
    const score = Number(Object.entries(dimensions).reduce(
      (sum,[key,value]) => sum + value * weights[key], 0
    ).toFixed(2));

    return freeze({
      propertyId: property.propertyId,
      label: property.label,
      score,
      dimensions: freeze(dimensions),
      evidenceCount: Number(property.evidenceCount || 0),
      status: property.evidenceCount ? 'MATCHED' : 'INSUFFICIENT_EVIDENCE',
      approvalRequired: true,
      autonomousCommitmentAllowed: false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    requirementId: requirement.requirementId || null,
    matches: freeze(scored),
    total: scored.length,
    matched: scored.filter(item=>item.status==='MATCHED').length,
    topMatch: scored[0] || null,
    explainable: true,
    evidenceRequired: true,
    approvalRequired: true,
    autonomousCommitmentAllowed: false
  });
}

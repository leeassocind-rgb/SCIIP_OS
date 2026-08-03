const freeze = value => Object.freeze(value);

export function evaluateStrategicAssurance({controls=[],evidence=[]}={}) {
  const evidenceMap = new Map();
  for(const item of evidence){
    if(!evidenceMap.has(item.controlId)) evidenceMap.set(item.controlId,[]);
    evidenceMap.get(item.controlId).push(item);
  }

  const evaluated = controls.map(control => {
    const linked = evidenceMap.get(control.controlId) || [];
    const passed = Boolean(control.implemented) && linked.length >= Number(control.minimumEvidence || 1);
    return freeze({
      ...control,
      evidenceCount:linked.length,
      passed,
      status:passed?'ASSURED':'GAP',
      remediationRequired:!passed
    });
  });

  return freeze({
    controls:freeze(evaluated),
    total:evaluated.length,
    passed:evaluated.filter(c=>c.passed).length,
    failed:evaluated.filter(c=>!c.passed).length,
    evidencePreserved:true,
    assuranceIndependent:true,
    executiveReviewRequired:true,
    autonomousCertificationAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function evaluateGovernancePolicies({policies=[],evidence=[]}={}) {
  const ids=new Set(evidence.map(item=>item.evidenceId));
  const results=policies.map(policy=>{
    const refs=[...(policy.evidenceIds||[])];
    const supported=refs.length>=Number(policy.minimumEvidence||1)&&refs.every(id=>ids.has(id));
    const passed=Boolean(policy.implemented)&&supported;
    return freeze({
      ...policy,
      evidenceCount:refs.length,
      supported,
      passed,
      status:passed?'COMPLIANT':'NON_COMPLIANT',
      remediationRequired:!passed
    });
  });

  return freeze({
    policies:freeze(results),
    total:results.length,
    compliant:results.filter(p=>p.passed).length,
    nonCompliant:results.filter(p=>!p.passed).length,
    evidenceRequired:true,
    permanentHistory:true,
    autonomousPolicyChangesAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function createExecutiveGovernanceCommand({policies=[],auditPackages=[],requirements=[],releases=[],approvals=[]}={}) {
  const attention=[
    ...policies.filter(p=>!p.passed).map(p=>freeze({type:'POLICY_GAP',id:p.policyId})),
    ...auditPackages.filter(p=>!p.complete).map(p=>freeze({type:'AUDIT_GAP',id:p.controlId})),
    ...requirements.filter(r=>r.status!=='READY').map(r=>freeze({type:'COMPLIANCE_GAP',id:r.requirementId})),
    ...releases.filter(r=>r.status!=='RELEASE_READY').map(r=>freeze({type:'RELEASE_BLOCK',id:r.releaseId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    policies:freeze([...policies]),
    auditPackages:freeze([...auditPackages]),
    requirements:freeze([...requirements]),
    releases:freeze([...releases]),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    governanceCommandReady:true,
    executiveReviewRequired:true,
    autonomousPolicyChangesAllowed:false,
    autonomousReleaseAllowed:false
  });
}

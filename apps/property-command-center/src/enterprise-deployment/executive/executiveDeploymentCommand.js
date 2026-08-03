const freeze=v=>Object.freeze(v);

export function createExecutiveDeploymentCommand({readiness={},adoption={},value={},enablement={},approvals=[]}={}) {
  const attention=[
    ...(readiness.checks||[]).filter(c=>!c.passed).map(c=>freeze({type:'READINESS_BLOCK',id:c.id||c.gateId})),
    ...(adoption.workspaceUsage||[]).filter(w=>w.status==='UNUSED').map(w=>freeze({type:'ADOPTION_GAP',id:w.workspaceId})),
    ...(value.initiatives||[]).filter(i=>i.status==='VALUE_AT_RISK').map(i=>freeze({type:'VALUE_RISK',id:i.initiativeId})),
    ...(enablement.plans||[]).filter(p=>p.status==='BLOCKED').map(p=>freeze({type:'ENABLEMENT_BLOCK',id:p.audienceId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];
  return freeze({
    readiness:freeze({...readiness}),
    adoption:freeze({...adoption}),
    value:freeze({...value}),
    enablement:freeze({...enablement}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    deploymentCommandReady:true,
    executiveReviewRequired:true,
    autonomousDeploymentAllowed:false,
    autonomousCommunicationAllowed:false
  });
}

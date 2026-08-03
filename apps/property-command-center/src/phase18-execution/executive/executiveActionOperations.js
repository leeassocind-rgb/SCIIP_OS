const freeze=v=>Object.freeze(v);

export function createExecutiveActionOperations({planning={},approvals={},execution={},audit={}}={}) {
  const attention=[
    ...(planning.actions||[]).filter(a=>a.status==='BLOCKED').map(a=>freeze({type:'ACTION_BLOCK',id:a.actionId})),
    ...(approvals.requests||[]).filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL_PENDING',id:a.requestId})),
    ...(execution.actions||[]).filter(a=>a.status==='BLOCKED').map(a=>freeze({type:'EXECUTION_BLOCK',id:a.actionId})),
    ...(audit.executions||[]).filter(a=>!a.rollbackAvailable).map(a=>freeze({type:'ROLLBACK_GAP',id:a.executionId}))
  ];

  return freeze({
    planning:freeze({...planning}),
    approvals:freeze({...approvals}),
    execution:freeze({...execution}),
    audit:freeze({...audit}),
    attention:freeze(attention),
    attentionCount:attention.length,
    actionOperationsReady:true,
    humanApprovalRequired:true,
    dryRunRequired:true,
    autonomousExecutionAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function executeControlledActions({actions=[],approvals=[],dryRun=true}={}) {
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.actionId));
  const results=actions.map(action=>{
    const approvalSatisfied=approved.has(action.actionId);
    const executable=approvalSatisfied&&!action.blocked;
    return freeze({
      ...action,
      approvalSatisfied,
      dryRun,
      executed:executable&&!dryRun,
      status:!executable?'BLOCKED':dryRun?'DRY_RUN_READY':'EXECUTED'
    });
  });

  return freeze({
    actions:freeze(results),
    total:results.length,
    executable:results.filter(r=>r.status==='DRY_RUN_READY'||r.status==='EXECUTED').length,
    executed:results.filter(r=>r.status==='EXECUTED').length,
    dryRun,
    rollbackRequired:true,
    autonomousExecutionAllowed:false
  });
}

const freeze=v=>Object.freeze(v);

export function buildExecutionAudit({executions=[],rollbackPlans=[]}={}) {
  const rollbackMap=new Map(rollbackPlans.map(r=>[r.executionId,r]));
  const rows=executions.map(execution=>{
    const rollback=rollbackMap.get(execution.executionId);
    return freeze({
      ...execution,
      rollbackAvailable:Boolean(rollback),
      rollbackStatus:rollback?.status||'NOT_DEFINED',
      immutableAuditRecord:true
    });
  });

  return freeze({
    executions:freeze(rows),
    total:rows.length,
    rollbackReady:rows.filter(r=>r.rollbackAvailable).length,
    immutableAuditTrail:true,
    rollbackRequired:true,
    autonomousRollbackAllowed:false
  });
}

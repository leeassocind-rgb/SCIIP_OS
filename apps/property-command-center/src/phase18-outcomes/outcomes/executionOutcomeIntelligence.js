const freeze=v=>Object.freeze(v);

export function evaluateExecutionOutcomes({executions=[],outcomes=[]}={}) {
  const outcomeMap=new Map(outcomes.map(item=>[item.executionId,item]));
  const rows=executions.map(execution=>{
    const outcome=outcomeMap.get(execution.executionId);
    const completed=Boolean(outcome);
    const successful=completed&&outcome.status==='SUCCESS';
    return freeze({
      ...execution,
      outcome:outcome?freeze({...outcome}):null,
      completed,
      successful,
      status:!completed?'OUTCOME_PENDING':successful?'OUTCOME_SUCCESS':'OUTCOME_ATTENTION'
    });
  });

  return freeze({
    executions:freeze(rows),
    total:rows.length,
    completed:rows.filter(r=>r.completed).length,
    successful:rows.filter(r=>r.successful).length,
    pending:rows.filter(r=>!r.completed).length,
    permanentOutcomeHistory:true,
    autonomousOutcomeChangesAllowed:false
  });
}

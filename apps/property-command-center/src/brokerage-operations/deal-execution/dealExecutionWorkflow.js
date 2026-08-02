const freeze=v=>Object.freeze(v);

export function createDealExecutionWorkflow({dealId,steps=[],approvals=[]}={}) {
  if(!dealId) throw new Error('dealId is required');
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));

  const workflow=steps.map((step,index)=>{
    const approvalSatisfied=!step.approvalId||approved.has(step.approvalId);
    return freeze({
      stepId:step.stepId||`STEP-${String(index+1).padStart(3,'0')}`,
      label:step.label,
      sequence:index+1,
      approvalSatisfied,
      status:approvalSatisfied?'READY':'BLOCKED',
      autoExecute:false
    });
  });

  return freeze({
    dealId,
    steps:freeze(workflow),
    ready:workflow.filter(step=>step.status==='READY').length,
    blocked:workflow.filter(step=>step.status==='BLOCKED').length,
    approvalAware:true,
    permanentHistory:true,
    autonomousExecutionAllowed:false
  });
}

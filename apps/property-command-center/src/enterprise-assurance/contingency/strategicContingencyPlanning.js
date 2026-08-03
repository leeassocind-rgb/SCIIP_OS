const freeze = value => Object.freeze(value);

export function buildContingencyPlans({risks=[],actions=[],approvals=[]}={}) {
  const approved = new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));
  const plans = risks.map(risk => {
    const linked = actions.filter(action=>action.riskId===risk.riskId);
    const readiness = linked.length
      ? Number((linked.filter(a=>!a.approvalId||approved.has(a.approvalId)).length / linked.length * 100).toFixed(2))
      : 0;

    return freeze({
      riskId:risk.riskId,
      severity:risk.severity,
      actions:freeze(linked.map(action=>freeze({
        ...action,
        approvalSatisfied:!action.approvalId||approved.has(action.approvalId),
        autoExecute:false
      }))),
      readinessPct:readiness,
      status:readiness===100?'READY':readiness>0?'PARTIAL':'NOT_READY'
    });
  });

  return freeze({
    plans:freeze(plans),
    total:plans.length,
    ready:plans.filter(p=>p.status==='READY').length,
    approvalAware:true,
    permanentHistory:true,
    executiveApprovalRequired:true,
    autonomousExecutionAllowed:false
  });
}

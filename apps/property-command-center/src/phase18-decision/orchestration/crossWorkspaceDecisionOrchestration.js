const freeze=v=>Object.freeze(v);

export function orchestrateCrossWorkspaceDecisions({decisions=[],workspaces=[],approvals=[]}={}) {
  const workspaceIds=new Set(workspaces.map(w=>w.workspaceId));
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));

  const rows=decisions.map(decision=>{
    const destinations=(decision.workspaceIds||[]).filter(id=>workspaceIds.has(id));
    const approvalSatisfied=!decision.approvalId||approved.has(decision.approvalId);
    return freeze({
      ...decision,
      destinations:freeze(destinations),
      workspaceCoverage:destinations.length,
      approvalSatisfied,
      status:destinations.length&&approvalSatisfied?'READY_FOR_ORCHESTRATION':'BLOCKED',
      autoExecute:false
    });
  });

  return freeze({
    decisions:freeze(rows),
    total:rows.length,
    ready:rows.filter(r=>r.status==='READY_FOR_ORCHESTRATION').length,
    blocked:rows.filter(r=>r.status==='BLOCKED').length,
    crossWorkspace:true,
    approvalAware:true,
    autonomousExecutionAllowed:false
  });
}

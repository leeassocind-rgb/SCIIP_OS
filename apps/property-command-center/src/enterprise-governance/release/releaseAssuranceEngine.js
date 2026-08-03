const freeze=v=>Object.freeze(v);

export function evaluateReleaseAssurance({releaseId,gates=[],approvals=[]}={}) {
  if(!releaseId)throw new Error('releaseId is required');
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));
  const checks=gates.map(gate=>{
    const approvalSatisfied=!gate.approvalId||approved.has(gate.approvalId);
    const passed=Boolean(gate.passed)&&approvalSatisfied;
    return freeze({
      ...gate,
      approvalSatisfied,
      passed,
      status:passed?'PASSED':'BLOCKED'
    });
  });

  const failed=checks.filter(c=>!c.passed).length;
  return freeze({
    releaseId,
    gates:freeze(checks),
    gatesRun:checks.length,
    gatesPassed:checks.length-failed,
    gatesFailed:failed,
    status:failed?'BLOCKED':'RELEASE_READY',
    approvalRequired:true,
    immutableDecisionRecord:true,
    autonomousReleaseAllowed:false
  });
}

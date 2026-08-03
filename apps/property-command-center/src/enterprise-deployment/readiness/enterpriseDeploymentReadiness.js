const freeze=v=>Object.freeze(v);

export function evaluateEnterpriseDeploymentReadiness({environments=[],gates=[],approvals=[]}={}) {
  const approved=new Set(approvals.filter(a=>a.status==='APPROVED').map(a=>a.approvalId));
  const checks=gates.map(gate=>{
    const approvalSatisfied=!gate.approvalId||approved.has(gate.approvalId);
    const passed=Boolean(gate.passed)&&approvalSatisfied;
    return freeze({...gate,approvalSatisfied,passed,status:passed?'PASSED':'BLOCKED'});
  });
  const readyEnvironments=environments.filter(e=>e.status==='READY').length;
  const failed=checks.filter(c=>!c.passed).length;
  return freeze({
    environments:freeze([...environments]),
    checks:freeze(checks),
    environmentsReady:readyEnvironments,
    gatesRun:checks.length,
    gatesPassed:checks.length-failed,
    gatesFailed:failed,
    status:failed||readyEnvironments!==environments.length?'BLOCKED':'DEPLOYMENT_READY',
    approvalRequired:true,
    rollbackRequired:true,
    autonomousDeploymentAllowed:false
  });
}

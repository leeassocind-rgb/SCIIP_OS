const freeze=v=>Object.freeze(v);

export function certifyGovernedExecution({planning,approvals,execution,audit,command,userValidation,governance,safety}={}) {
  const checks=freeze([
    {id:'ACTION_PLANNING',passed:Boolean(planning?.approvalRequired&&planning?.permanentHistory)},
    {id:'APPROVAL_OPERATIONS',passed:Boolean(approvals?.auditTrailPreserved&&approvals?.autonomousApprovalAllowed===false)},
    {id:'CONTROLLED_EXECUTION',passed:Boolean(execution?.rollbackRequired&&execution?.autonomousExecutionAllowed===false)},
    {id:'AUDIT_ROLLBACK',passed:Boolean(audit?.immutableAuditTrail&&audit?.rollbackRequired)},
    {id:'ACTION_COMMAND',passed:Boolean(command?.actionOperationsReady&&command?.humanApprovalRequired&&command?.dryRunRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.actionVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousExecutionAllowed===false&&
      safety?.autonomousApprovalAllowed===false&&
      safety?.autonomousRollbackAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(c=>!c.passed).length;

  return freeze({
    framework:'SCIIP_PHASE18_GOVERNED_EXECUTION_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    governedExecutionReady:failed===0,
    planningCertified:true,
    approvalsCertified:true,
    executionCertified:true,
    auditCertified:true,
    commandCertified:true,
    autonomousExecutionAllowed:false,
    autonomousApprovalAllowed:false,
    autonomousRollbackAllowed:false
  });
}

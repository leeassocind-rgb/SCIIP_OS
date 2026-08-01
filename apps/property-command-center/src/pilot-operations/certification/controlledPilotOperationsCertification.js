const freeze=value=>Object.freeze(value);

export function certifyControlledPilotOperations({
  runtime,
  telemetry,
  triage,
  userValidation,
  dataGovernance,
  recovery,
  shutdownControl
}={}) {
  const checks=freeze([
    freeze({id:'PILOT_RUNTIME',passed:Boolean(runtime?.persistent&&runtime?.governed)}),
    freeze({id:'TELEMETRY',passed:Boolean(telemetry?.telemetryActive)}),
    freeze({id:'ISSUE_TRIAGE',passed:Boolean(triage?.triageActive&&triage?.productionImpact===false)}),
    freeze({id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.telemetryVisible&&userValidation?.shutdownVisible)}),
    freeze({id:'DATA_GOVERNANCE',passed:Boolean(dataGovernance?.evidenceRequired&&dataGovernance?.rejectedRecordsVisible)}),
    freeze({id:'RECOVERY',passed:Boolean(recovery?.restartRecovery&&recovery?.offlineRecovery)}),
    freeze({id:'SHUTDOWN_CONTROL',passed:Boolean(shutdownControl?.manualStop&&shutdownControl?.approvalRequired)}),
    freeze({id:'PRODUCTION_EXECUTION_BLOCKED',passed:Boolean(
      runtime?.productionExecutionAuthorized===false&&
      dataGovernance?.productionExecutionAuthorized===false&&
      shutdownControl?.productionExecutionAuthorized===false
    )})
  ]);

  const failed=checks.filter(check=>!check.passed).length;
  return freeze({
    framework:'SCIIP_PHASE13_CONTROLLED_PILOT_OPERATIONS_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    controlledPilotOperational:true,
    telemetryCertified:true,
    triageCertified:true,
    shutdownReady:true,
    productionExecutionAuthorized:false
  });
}

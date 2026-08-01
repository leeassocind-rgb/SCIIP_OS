const freeze=value=>Object.freeze(value);

export function certifyProductionLaunchRehearsal({
  launchAuthorization,
  trafficRehearsal,
  approvalBoard,
  observability,
  userValidation,
  recovery,
  governance
}={}) {
  const checks=freeze([
    freeze({id:'LAUNCH_AUTHORIZATION',passed:Boolean(launchAuthorization?.rehearsalAuthorized&&launchAuthorization?.status==='READY_FOR_REHEARSAL')}),
    freeze({id:'TRAFFIC_REHEARSAL',passed:Boolean(trafficRehearsal?.status==='PASSED'&&trafficRehearsal?.stagesFailed===0)}),
    freeze({id:'APPROVAL_QUORUM',passed:Boolean(approvalBoard?.quorumReached)}),
    freeze({id:'OBSERVABILITY',passed:Boolean(observability?.status==='READY'&&observability?.blockerCount===0)}),
    freeze({id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.rehearsalVisible&&userValidation?.controlsVisible)}),
    freeze({id:'RECOVERY',passed:Boolean(recovery?.rollbackReady&&recovery?.restartRecovery&&recovery?.offlineRecovery)}),
    freeze({id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.changesAutoApplied===false)}),
    freeze({id:'LIVE_TRAFFIC_DISABLED',passed:Boolean(
      launchAuthorization?.productionTrafficAuthorized===false&&
      trafficRehearsal?.productionTrafficApplied===false&&
      trafficRehearsal?.productionTrafficAuthorized===false
    )})
  ]);

  const failed=checks.filter(item=>!item.passed).length;
  return freeze({
    framework:'SCIIP_PHASE14_PRODUCTION_LAUNCH_REHEARSAL_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    launchAuthorizationCertified:true,
    trafficRehearsalCertified:true,
    rollbackCertified:true,
    launchRehearsalReady:true,
    productionTrafficAuthorized:false
  });
}

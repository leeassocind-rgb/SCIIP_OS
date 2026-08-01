const freeze=value=>Object.freeze(value);

export function createProductionReadinessObservability({
  deployments=[],
  telemetry=[],
  incidents=[],
  approvals=[],
  recoveryTests=[],
  performance={}
}={}) {
  const activeDeployments=deployments.filter(item=>item.status==='ACTIVE').length;
  const failedTelemetry=telemetry.filter(item=>item.success===false).length;
  const openIncidents=incidents.filter(item=>item.status!=='CLOSED').length;
  const criticalIncidents=incidents.filter(item=>item.severity==='CRITICAL'&&item.status!=='CLOSED').length;
  const pendingApprovals=approvals.filter(item=>item.status==='PENDING').length;
  const recoveryPassed=recoveryTests.length>0&&recoveryTests.every(item=>item.passed);
  const performanceReady=Boolean(performance.buildPassed&&performance.interactionReady&&performance.memoryWithinBudget);

  const blockers=[];
  if(criticalIncidents)blockers.push('CRITICAL_INCIDENTS');
  if(!recoveryPassed)blockers.push('RECOVERY');
  if(!performanceReady)blockers.push('PERFORMANCE');
  if(pendingApprovals)blockers.push('PENDING_APPROVALS');

  return freeze({
    activeDeployments,
    failedTelemetry,
    openIncidents,
    criticalIncidents,
    pendingApprovals,
    recoveryPassed,
    performanceReady,
    blockers:freeze(blockers),
    blockerCount:blockers.length,
    status:blockers.length?'BLOCKED':'READY',
    traceable:true,
    auditable:true,
    productionDeploymentAuthorized:false
  });
}

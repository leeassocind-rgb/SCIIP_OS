/**
 * SCIIP_OS v6.0 — 14140_ReconciliationResolutionPlanProcessor
 */
function sciipRun14140_ReconciliationResolutionPlanProcessor() {
  var cfg = {
    processorNumber: 14140,
    processorName: 'ReconciliationResolutionPlan',
    component: 'Storage Reconciliation Execution',
    backendLayer: 'Storage Reconciliation',
    sourceSheet: 'RECONCILIATION_COMPARISON',
    targetSheet: 'RECONCILIATION_RESOLUTION_PLAN',
    statusField: 'reconciliationResolutionPlanStatus',
    nextAction: 'Run 14150_ReconciliationVerificationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECONCILIATION_BACKEND.executeReconciliationPlan(cfg);
}

function sciipTest14140_ReconciliationResolutionPlanProcessor() {
  var result = sciipRun14140_ReconciliationResolutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14140_ReconciliationResolutionPlanProcessor', result: result }));
  return result;
}

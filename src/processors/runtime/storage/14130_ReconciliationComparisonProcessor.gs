/**
 * SCIIP_OS v6.0 — 14130_ReconciliationComparisonProcessor
 */
function sciipRun14130_ReconciliationComparisonProcessor() {
  var cfg = {
    processorNumber: 14130,
    processorName: 'ReconciliationComparison',
    component: 'Storage Reconciliation Execution',
    backendLayer: 'Storage Reconciliation',
    sourceSheet: 'RECONCILIATION_DISCOVERY',
    targetSheet: 'RECONCILIATION_COMPARISON',
    statusField: 'reconciliationComparisonStatus',
    nextAction: 'Run 14140_ReconciliationResolutionPlanProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECONCILIATION_BACKEND.executeReconciliationPlan(cfg);
}

function sciipTest14130_ReconciliationComparisonProcessor() {
  var result = sciipRun14130_ReconciliationComparisonProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14130_ReconciliationComparisonProcessor', result: result }));
  return result;
}

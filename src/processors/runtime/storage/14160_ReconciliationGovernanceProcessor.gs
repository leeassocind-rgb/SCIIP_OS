/**
 * SCIIP_OS v6.0 — 14160_ReconciliationGovernanceProcessor
 */
function sciipRun14160_ReconciliationGovernanceProcessor() {
  var cfg = {
    processorNumber: 14160,
    processorName: 'ReconciliationGovernance',
    component: 'Storage Reconciliation Execution',
    backendLayer: 'Storage Reconciliation',
    sourceSheet: 'RECONCILIATION_VERIFICATION',
    targetSheet: 'RECONCILIATION_GOVERNANCE',
    statusField: 'reconciliationGovernanceStatus',
    nextAction: 'Run 14170_ReconciliationValidationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECONCILIATION_BACKEND.executeReconciliationPlan(cfg);
}

function sciipTest14160_ReconciliationGovernanceProcessor() {
  var result = sciipRun14160_ReconciliationGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14160_ReconciliationGovernanceProcessor', result: result }));
  return result;
}

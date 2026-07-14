/**
 * SCIIP_OS v6.0 — 14170_ReconciliationValidationProcessor
 */
function sciipRun14170_ReconciliationValidationProcessor() {
  var cfg = {
    processorNumber: 14170,
    processorName: 'ReconciliationValidation',
    component: 'Storage Reconciliation Execution',
    backendLayer: 'Storage Reconciliation',
    sourceSheet: 'RECONCILIATION_GOVERNANCE',
    targetSheet: 'RECONCILIATION_VALIDATIONS',
    statusField: 'reconciliationValidationStatus',
    nextAction: 'Run 14180_ReconciliationCertificationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECONCILIATION_BACKEND.executeReconciliationPlan(cfg);
}

function sciipTest14170_ReconciliationValidationProcessor() {
  var result = sciipRun14170_ReconciliationValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14170_ReconciliationValidationProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 14120_ReconciliationDiscoveryProcessor
 */
function sciipRun14120_ReconciliationDiscoveryProcessor() {
  var cfg = {
    processorNumber: 14120,
    processorName: 'ReconciliationDiscovery',
    component: 'Storage Reconciliation Execution',
    backendLayer: 'Storage Reconciliation',
    sourceSheet: 'RECONCILIATION_POLICY_REGISTRY',
    targetSheet: 'RECONCILIATION_DISCOVERY',
    statusField: 'reconciliationDiscoveryStatus',
    nextAction: 'Run 14130_ReconciliationComparisonProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECONCILIATION_BACKEND.executeReconciliationPlan(cfg);
}

function sciipTest14120_ReconciliationDiscoveryProcessor() {
  var result = sciipRun14120_ReconciliationDiscoveryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14120_ReconciliationDiscoveryProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 14600_StorageBalancingReadinessProcessor
 */
function sciipRun14600_StorageBalancingReadinessProcessor() {
  var cfg = {
    processorNumber: 14600,
    processorName: 'StorageBalancingReadiness',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'MIGRATION_ACCEPTANCES',
    targetSheet: 'STORAGE_BALANCING_READINESS',
    statusField: 'storageBalancingReadinessStatus',
    nextAction: 'Run 14610_BalancingPolicyRegistryProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14600_StorageBalancingReadinessProcessor() {
  var result = sciipRun14600_StorageBalancingReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14600_StorageBalancingReadinessProcessor', result: result }));
  return result;
}

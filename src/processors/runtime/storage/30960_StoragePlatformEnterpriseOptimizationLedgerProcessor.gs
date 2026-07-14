/**
 * SCIIP_OS v6.0 — 30960 StoragePlatformEnterpriseOptimizationLedger
 */
function sciipRun30960_StoragePlatformEnterpriseOptimizationLedgerProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_OPTIMIZATION_BACKEND.executePlatformEnterpriseOptimizationPlan({
    processorNumber: 30960,
    processorName: 'StoragePlatformEnterpriseOptimizationLedger',
    statusField: 'storagePlatformEnterpriseOptimizationLedgerStatus',
    component: 'Storage Platform Enterprise Optimization Execution',
    backendLayer: 'Storage Platform Enterprise Optimization',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_OPTIMIZATION_EXECUTION',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_OPTIMIZATION_LEDGER',
    nextAction: 'Run 30970_StoragePlatformEnterpriseOptimizationValidationProcessor after this processor completes.'
  });
}

function sciipTest30960_StoragePlatformEnterpriseOptimizationLedgerProcessor() {
  var result = sciipRun30960_StoragePlatformEnterpriseOptimizationLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30960_StoragePlatformEnterpriseOptimizationLedgerProcessor',
    result: result
  }));
  return result;
}

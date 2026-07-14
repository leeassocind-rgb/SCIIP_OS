/**
 * SCIIP_OS v6.0 — 25360 StoragePlatformCapacityLedger
 */
function sciipRun25360_StoragePlatformCapacityLedgerProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25360,
    processorName: 'StoragePlatformCapacityLedger',
    statusField: 'storagePlatformCapacityLedgerStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_EXECUTION',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_LEDGER',
    nextAction: 'Run 25370_StoragePlatformCapacityValidationProcessor after this processor completes.'
  });
}

function sciipTest25360_StoragePlatformCapacityLedgerProcessor() {
  var result = sciipRun25360_StoragePlatformCapacityLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25360_StoragePlatformCapacityLedgerProcessor',
    result: result
  }));
  return result;
}

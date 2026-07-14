/**
 * SCIIP_OS v6.0 — 25300 StoragePlatformCapacityReadiness
 */
function sciipRun25300_StoragePlatformCapacityReadinessProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25300,
    processorName: 'StoragePlatformCapacityReadiness',
    statusField: 'storagePlatformCapacityReadinessStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_READINESS_ACCEPTANCES',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_READINESS',
    nextAction: 'Run 25310_StoragePlatformCapacityPolicyRegistryProcessor after this processor completes.'
  });
}

function sciipTest25300_StoragePlatformCapacityReadinessProcessor() {
  var result = sciipRun25300_StoragePlatformCapacityReadinessProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25300_StoragePlatformCapacityReadinessProcessor',
    result: result
  }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 25390 StoragePlatformCapacityAcceptance
 */
function sciipRun25390_StoragePlatformCapacityAcceptanceProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25390,
    processorName: 'StoragePlatformCapacityAcceptance',
    statusField: 'storagePlatformCapacityAcceptanceStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_CERTIFICATION',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_ACCEPTANCE',
    nextAction: 'Storage Platform Capacity Execution accepted through 25390.'
  });
}

function sciipTest25390_StoragePlatformCapacityAcceptanceProcessor() {
  var result = sciipRun25390_StoragePlatformCapacityAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25390_StoragePlatformCapacityAcceptanceProcessor',
    result: result
  }));
  return result;
}

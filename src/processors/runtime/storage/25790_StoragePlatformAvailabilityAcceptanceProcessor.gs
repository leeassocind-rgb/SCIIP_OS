/**
 * SCIIP_OS v6.0 — 25790 StoragePlatformAvailabilityAcceptance
 */
function sciipRun25790_StoragePlatformAvailabilityAcceptanceProcessor() {
  return SCIIP_STORAGE_PLATFORM_AVAILABILITY_BACKEND.executePlatformAvailabilityPlan({
    processorNumber: 25790,
    processorName: 'StoragePlatformAvailabilityAcceptance',
    statusField: 'storagePlatformAvailabilityAcceptanceStatus',
    component: 'Storage Platform Availability Execution',
    backendLayer: 'Storage Platform Availability',
    sourceSheet: 'STORAGE_PLATFORM_AVAILABILITY_CERTIFICATION',
    targetSheet: 'STORAGE_PLATFORM_AVAILABILITY_ACCEPTANCE',
    nextAction: 'Storage Platform Availability Execution accepted through 25790.'
  });
}

function sciipTest25790_StoragePlatformAvailabilityAcceptanceProcessor() {
  var result = sciipRun25790_StoragePlatformAvailabilityAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25790_StoragePlatformAvailabilityAcceptanceProcessor',
    result: result
  }));
  return result;
}

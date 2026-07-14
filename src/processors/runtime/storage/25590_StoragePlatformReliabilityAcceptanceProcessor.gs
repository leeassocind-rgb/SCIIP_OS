/**
 * SCIIP_OS v6.0 — 25590 StoragePlatformReliabilityAcceptance
 */
function sciipRun25590_StoragePlatformReliabilityAcceptanceProcessor() {
  return SCIIP_STORAGE_PLATFORM_RELIABILITY_BACKEND.executePlatformReliabilityPlan({
    processorNumber: 25590,
    processorName: 'StoragePlatformReliabilityAcceptance',
    statusField: 'storagePlatformReliabilityAcceptanceStatus',
    component: 'Storage Platform Reliability Execution',
    backendLayer: 'Storage Platform Reliability',
    sourceSheet: 'STORAGE_PLATFORM_RELIABILITY_CERTIFICATION',
    targetSheet: 'STORAGE_PLATFORM_RELIABILITY_ACCEPTANCE',
    nextAction: 'Storage Platform Reliability Execution accepted through 25590.'
  });
}

function sciipTest25590_StoragePlatformReliabilityAcceptanceProcessor() {
  var result = sciipRun25590_StoragePlatformReliabilityAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25590_StoragePlatformReliabilityAcceptanceProcessor',
    result: result
  }));
  return result;
}

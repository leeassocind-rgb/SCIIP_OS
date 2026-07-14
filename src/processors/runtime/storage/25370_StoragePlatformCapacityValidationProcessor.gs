/**
 * SCIIP_OS v6.0 — 25370 StoragePlatformCapacityValidation
 */
function sciipRun25370_StoragePlatformCapacityValidationProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25370,
    processorName: 'StoragePlatformCapacityValidation',
    statusField: 'storagePlatformCapacityValidationStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_LEDGER',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_VALIDATION',
    nextAction: 'Run 25380_StoragePlatformCapacityCertificationProcessor after this processor completes.'
  });
}

function sciipTest25370_StoragePlatformCapacityValidationProcessor() {
  var result = sciipRun25370_StoragePlatformCapacityValidationProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25370_StoragePlatformCapacityValidationProcessor',
    result: result
  }));
  return result;
}

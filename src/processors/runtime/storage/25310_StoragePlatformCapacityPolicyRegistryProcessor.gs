/**
 * SCIIP_OS v6.0 — 25310 StoragePlatformCapacityPolicyRegistry
 */
function sciipRun25310_StoragePlatformCapacityPolicyRegistryProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25310,
    processorName: 'StoragePlatformCapacityPolicyRegistry',
    statusField: 'storagePlatformCapacityPolicyRegistryStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_READINESS',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_POLICY_REGISTRY',
    nextAction: 'Run 25320_StoragePlatformCapacityCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest25310_StoragePlatformCapacityPolicyRegistryProcessor() {
  var result = sciipRun25310_StoragePlatformCapacityPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25310_StoragePlatformCapacityPolicyRegistryProcessor',
    result: result
  }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 27210 StoragePlatformServiceManagementPolicyRegistry
 */
function sciipRun27210_StoragePlatformServiceManagementPolicyRegistryProcessor() {
  return SCIIP_STORAGE_PLATFORM_SERVICE_MANAGEMENT_BACKEND.executePlatformServiceManagementPlan({
    processorNumber: 27210,
    processorName: 'StoragePlatformServiceManagementPolicyRegistry',
    statusField: 'storagePlatformServiceManagementPolicyRegistryStatus',
    component: 'Storage Platform Service Management Execution',
    backendLayer: 'Storage Platform Service Management',
    sourceSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_READINESS',
    targetSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_POLICY_REGISTRY',
    nextAction: 'Run 27220_StoragePlatformServiceManagementCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest27210_StoragePlatformServiceManagementPolicyRegistryProcessor() {
  var result = sciipRun27210_StoragePlatformServiceManagementPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest27210_StoragePlatformServiceManagementPolicyRegistryProcessor',
    result: result
  }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 27310 StoragePlatformDemandManagementPolicyRegistry
 */
function sciipRun27310_StoragePlatformDemandManagementPolicyRegistryProcessor() {
  return SCIIP_STORAGE_PLATFORM_DEMAND_MANAGEMENT_BACKEND.executePlatformDemandManagementPlan({
    processorNumber: 27310,
    processorName: 'StoragePlatformDemandManagementPolicyRegistry',
    statusField: 'storagePlatformDemandManagementPolicyRegistryStatus',
    component: 'Storage Platform Demand Management Execution',
    backendLayer: 'Storage Platform Demand Management',
    sourceSheet: 'STORAGE_PLATFORM_DEMAND_MANAGEMENT_READINESS',
    targetSheet: 'STORAGE_PLATFORM_DEMAND_MANAGEMENT_POLICY_REGISTRY',
    nextAction: 'Run 27320_StoragePlatformDemandManagementCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest27310_StoragePlatformDemandManagementPolicyRegistryProcessor() {
  var result = sciipRun27310_StoragePlatformDemandManagementPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest27310_StoragePlatformDemandManagementPolicyRegistryProcessor',
    result: result
  }));
  return result;
}

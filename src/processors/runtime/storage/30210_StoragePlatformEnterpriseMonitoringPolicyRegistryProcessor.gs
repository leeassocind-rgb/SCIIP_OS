/**
 * SCIIP_OS v6.0 — 30210 StoragePlatformEnterpriseMonitoringPolicyRegistry
 */
function sciipRun30210_StoragePlatformEnterpriseMonitoringPolicyRegistryProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_MONITORING_BACKEND.executePlatformEnterpriseMonitoringPlan({
    processorNumber: 30210,
    processorName: 'StoragePlatformEnterpriseMonitoringPolicyRegistry',
    statusField: 'storagePlatformEnterpriseMonitoringPolicyRegistryStatus',
    component: 'Storage Platform Enterprise Monitoring Execution',
    backendLayer: 'Storage Platform Enterprise Monitoring',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_READINESS',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_POLICY_REGISTRY',
    nextAction: 'Run 30220_StoragePlatformEnterpriseMonitoringCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest30210_StoragePlatformEnterpriseMonitoringPolicyRegistryProcessor() {
  var result = sciipRun30210_StoragePlatformEnterpriseMonitoringPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30210_StoragePlatformEnterpriseMonitoringPolicyRegistryProcessor',
    result: result
  }));
  return result;
}

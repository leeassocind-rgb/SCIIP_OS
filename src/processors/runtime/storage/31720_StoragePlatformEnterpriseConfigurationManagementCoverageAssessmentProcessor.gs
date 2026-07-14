/**
 * SCIIP_OS v6.0 — 31720 StoragePlatformEnterpriseConfigurationManagementCoverageAssessment
 */
function sciipRun31720_StoragePlatformEnterpriseConfigurationManagementCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_CONFIGURATION_MANAGEMENT_BACKEND.executePlatformEnterpriseConfigurationManagementPlan({
    processorNumber: 31720,
    processorName: 'StoragePlatformEnterpriseConfigurationManagementCoverageAssessment',
    statusField: 'storagePlatformEnterpriseConfigurationManagementCoverageAssessmentStatus',
    component: 'Storage Platform Enterprise Configuration Management Execution',
    backendLayer: 'Storage Platform Enterprise Configuration Management',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_CONFIGURATION_MANAGEMENT_POLICY_REGISTRY',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_CONFIGURATION_MANAGEMENT_COVERAGE_ASSESSMENT',
    nextAction: 'Run 31730_StoragePlatformEnterpriseConfigurationManagementRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest31720_StoragePlatformEnterpriseConfigurationManagementCoverageAssessmentProcessor() {
  var result = sciipRun31720_StoragePlatformEnterpriseConfigurationManagementCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest31720_StoragePlatformEnterpriseConfigurationManagementCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}

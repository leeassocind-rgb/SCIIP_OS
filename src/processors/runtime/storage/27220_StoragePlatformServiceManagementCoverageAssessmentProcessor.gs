/**
 * SCIIP_OS v6.0 — 27220 StoragePlatformServiceManagementCoverageAssessment
 */
function sciipRun27220_StoragePlatformServiceManagementCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_PLATFORM_SERVICE_MANAGEMENT_BACKEND.executePlatformServiceManagementPlan({
    processorNumber: 27220,
    processorName: 'StoragePlatformServiceManagementCoverageAssessment',
    statusField: 'storagePlatformServiceManagementCoverageAssessmentStatus',
    component: 'Storage Platform Service Management Execution',
    backendLayer: 'Storage Platform Service Management',
    sourceSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_POLICY_REGISTRY',
    targetSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_COVERAGE_ASSESSMENT',
    nextAction: 'Run 27230_StoragePlatformServiceManagementRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest27220_StoragePlatformServiceManagementCoverageAssessmentProcessor() {
  var result = sciipRun27220_StoragePlatformServiceManagementCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest27220_StoragePlatformServiceManagementCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}

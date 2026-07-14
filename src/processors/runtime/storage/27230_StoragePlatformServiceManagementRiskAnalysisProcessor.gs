/**
 * SCIIP_OS v6.0 — 27230 StoragePlatformServiceManagementRiskAnalysis
 */
function sciipRun27230_StoragePlatformServiceManagementRiskAnalysisProcessor() {
  return SCIIP_STORAGE_PLATFORM_SERVICE_MANAGEMENT_BACKEND.executePlatformServiceManagementPlan({
    processorNumber: 27230,
    processorName: 'StoragePlatformServiceManagementRiskAnalysis',
    statusField: 'storagePlatformServiceManagementRiskAnalysisStatus',
    component: 'Storage Platform Service Management Execution',
    backendLayer: 'Storage Platform Service Management',
    sourceSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_COVERAGE_ASSESSMENT',
    targetSheet: 'STORAGE_PLATFORM_SERVICE_MANAGEMENT_RISK_ANALYSIS',
    nextAction: 'Run 27240_StoragePlatformServiceManagementPlanningProcessor after this processor completes.'
  });
}

function sciipTest27230_StoragePlatformServiceManagementRiskAnalysisProcessor() {
  var result = sciipRun27230_StoragePlatformServiceManagementRiskAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest27230_StoragePlatformServiceManagementRiskAnalysisProcessor',
    result: result
  }));
  return result;
}

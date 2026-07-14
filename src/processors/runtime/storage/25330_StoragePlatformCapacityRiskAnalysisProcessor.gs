/**
 * SCIIP_OS v6.0 — 25330 StoragePlatformCapacityRiskAnalysis
 */
function sciipRun25330_StoragePlatformCapacityRiskAnalysisProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25330,
    processorName: 'StoragePlatformCapacityRiskAnalysis',
    statusField: 'storagePlatformCapacityRiskAnalysisStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_COVERAGE_ASSESSMENT',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_RISK_ANALYSIS',
    nextAction: 'Run 25340_StoragePlatformCapacityPlanningProcessor after this processor completes.'
  });
}

function sciipTest25330_StoragePlatformCapacityRiskAnalysisProcessor() {
  var result = sciipRun25330_StoragePlatformCapacityRiskAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25330_StoragePlatformCapacityRiskAnalysisProcessor',
    result: result
  }));
  return result;
}

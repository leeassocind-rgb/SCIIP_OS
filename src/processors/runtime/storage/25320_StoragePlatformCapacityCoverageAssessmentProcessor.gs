/**
 * SCIIP_OS v6.0 — 25320 StoragePlatformCapacityCoverageAssessment
 */
function sciipRun25320_StoragePlatformCapacityCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_PLATFORM_CAPACITY_BACKEND.executePlatformCapacityPlan({
    processorNumber: 25320,
    processorName: 'StoragePlatformCapacityCoverageAssessment',
    statusField: 'storagePlatformCapacityCoverageAssessmentStatus',
    component: 'Storage Platform Capacity Execution',
    backendLayer: 'Storage Platform Capacity',
    sourceSheet: 'STORAGE_PLATFORM_CAPACITY_POLICY_REGISTRY',
    targetSheet: 'STORAGE_PLATFORM_CAPACITY_COVERAGE_ASSESSMENT',
    nextAction: 'Run 25330_StoragePlatformCapacityRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest25320_StoragePlatformCapacityCoverageAssessmentProcessor() {
  var result = sciipRun25320_StoragePlatformCapacityCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest25320_StoragePlatformCapacityCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}

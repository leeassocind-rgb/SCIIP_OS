/**
 * SCIIP_OS v6.0 — 30120 StoragePlatformEnterpriseAcceptanceCoverageAssessment
 */
function sciipRun30120_StoragePlatformEnterpriseAcceptanceCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_ACCEPTANCE_BACKEND.executePlatformEnterpriseAcceptancePlan({
    processorNumber: 30120,
    processorName: 'StoragePlatformEnterpriseAcceptanceCoverageAssessment',
    statusField: 'storagePlatformEnterpriseAcceptanceCoverageAssessmentStatus',
    component: 'Storage Platform Enterprise Acceptance Execution',
    backendLayer: 'Storage Platform Enterprise Acceptance',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_ACCEPTANCE_POLICY_REGISTRY',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_ACCEPTANCE_COVERAGE_ASSESSMENT',
    nextAction: 'Run 30130_StoragePlatformEnterpriseAcceptanceRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest30120_StoragePlatformEnterpriseAcceptanceCoverageAssessmentProcessor() {
  var result = sciipRun30120_StoragePlatformEnterpriseAcceptanceCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30120_StoragePlatformEnterpriseAcceptanceCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}

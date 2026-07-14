/**
 * SCIIP_OS v6.0 — 20120 CloudCoverageAssessment
 */
function sciipRun20120_CloudCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20120,
    processorName: 'CloudCoverageAssessment',
    statusField: 'cloudCoverageAssessmentStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_FEDERATION_POLICY_REGISTRY',
    targetSheet: 'CLOUD_COVERAGE_ASSESSMENT',
    nextAction: 'Run 20130_ProviderRiskAnalysisProcessor after this processor completes.'
  });
}

function sciipTest20120_CloudCoverageAssessmentProcessor() {
  var result = sciipRun20120_CloudCoverageAssessmentProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20120_CloudCoverageAssessmentProcessor',
    result: result
  }));
  return result;
}

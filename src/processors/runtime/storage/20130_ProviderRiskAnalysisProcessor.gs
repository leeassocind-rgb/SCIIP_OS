/**
 * SCIIP_OS v6.0 — 20130 ProviderRiskAnalysis
 */
function sciipRun20130_ProviderRiskAnalysisProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20130,
    processorName: 'ProviderRiskAnalysis',
    statusField: 'providerRiskAnalysisStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_COVERAGE_ASSESSMENT',
    targetSheet: 'PROVIDER_RISK_ANALYSIS',
    nextAction: 'Run 20140_CloudFederationPlanningProcessor after this processor completes.'
  });
}

function sciipTest20130_ProviderRiskAnalysisProcessor() {
  var result = sciipRun20130_ProviderRiskAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20130_ProviderRiskAnalysisProcessor',
    result: result
  }));
  return result;
}

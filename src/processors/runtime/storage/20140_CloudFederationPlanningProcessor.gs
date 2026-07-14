/**
 * SCIIP_OS v6.0 — 20140 CloudFederationPlanning
 */
function sciipRun20140_CloudFederationPlanningProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20140,
    processorName: 'CloudFederationPlanning',
    statusField: 'cloudFederationPlanningStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'PROVIDER_RISK_ANALYSIS',
    targetSheet: 'CLOUD_FEDERATION_PLANNING',
    nextAction: 'Run 20150_CloudFederationExecutionProcessor after this processor completes.'
  });
}

function sciipTest20140_CloudFederationPlanningProcessor() {
  var result = sciipRun20140_CloudFederationPlanningProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20140_CloudFederationPlanningProcessor',
    result: result
  }));
  return result;
}

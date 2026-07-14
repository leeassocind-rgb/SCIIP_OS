/**
 * SCIIP_OS v6.0 — 20150 CloudFederationExecution
 */
function sciipRun20150_CloudFederationExecutionProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20150,
    processorName: 'CloudFederationExecution',
    statusField: 'cloudFederationExecutionStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_FEDERATION_PLANNING',
    targetSheet: 'CLOUD_FEDERATION_EXECUTION',
    nextAction: 'Run 20160_CloudFederationLedgerProcessor after this processor completes.'
  });
}

function sciipTest20150_CloudFederationExecutionProcessor() {
  var result = sciipRun20150_CloudFederationExecutionProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20150_CloudFederationExecutionProcessor',
    result: result
  }));
  return result;
}

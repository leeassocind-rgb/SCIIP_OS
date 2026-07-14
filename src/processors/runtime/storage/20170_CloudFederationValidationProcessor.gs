/**
 * SCIIP_OS v6.0 — 20170 CloudFederationValidation
 */
function sciipRun20170_CloudFederationValidationProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20170,
    processorName: 'CloudFederationValidation',
    statusField: 'cloudFederationValidationStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_FEDERATION_LEDGER',
    targetSheet: 'CLOUD_FEDERATION_VALIDATIONS',
    nextAction: 'Run 20180_CloudFederationCertificationProcessor after this processor completes.'
  });
}

function sciipTest20170_CloudFederationValidationProcessor() {
  var result = sciipRun20170_CloudFederationValidationProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20170_CloudFederationValidationProcessor',
    result: result
  }));
  return result;
}

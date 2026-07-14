/**
 * SCIIP_OS v6.0 — 20180 CloudFederationCertification
 */
function sciipRun20180_CloudFederationCertificationProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20180,
    processorName: 'CloudFederationCertification',
    statusField: 'cloudFederationCertificationStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_FEDERATION_VALIDATIONS',
    targetSheet: 'CLOUD_FEDERATION_CERTIFICATIONS',
    nextAction: 'Run 20190_CloudFederationAcceptanceProcessor after this processor completes.'
  });
}

function sciipTest20180_CloudFederationCertificationProcessor() {
  var result = sciipRun20180_CloudFederationCertificationProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20180_CloudFederationCertificationProcessor',
    result: result
  }));
  return result;
}

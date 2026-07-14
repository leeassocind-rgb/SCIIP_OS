/**
 * SCIIP_OS v6.0 — 20160 CloudFederationLedger
 */
function sciipRun20160_CloudFederationLedgerProcessor() {
  return SCIIP_STORAGE_CLOUD_FEDERATION_BACKEND.executeCloudFederationPlan({
    processorNumber: 20160,
    processorName: 'CloudFederationLedger',
    statusField: 'cloudFederationLedgerStatus',
    component: 'Storage Cloud Federation Execution',
    backendLayer: 'Storage Cloud Federation',
    sourceSheet: 'CLOUD_FEDERATION_EXECUTION',
    targetSheet: 'CLOUD_FEDERATION_LEDGER',
    nextAction: 'Run 20170_CloudFederationValidationProcessor after this processor completes.'
  });
}

function sciipTest20160_CloudFederationLedgerProcessor() {
  var result = sciipRun20160_CloudFederationLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest20160_CloudFederationLedgerProcessor',
    result: result
  }));
  return result;
}

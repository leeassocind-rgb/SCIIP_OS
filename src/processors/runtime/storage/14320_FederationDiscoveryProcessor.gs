/**
 * SCIIP_OS v6.0 — 14320_FederationDiscoveryProcessor
 */
function sciipRun14320_FederationDiscoveryProcessor() {
  var cfg = {
    processorNumber: 14320,
    processorName: 'FederationDiscovery',
    component: 'Storage Federation Execution',
    backendLayer: 'Storage Federation',
    sourceSheet: 'FEDERATION_POLICY_REGISTRY',
    targetSheet: 'FEDERATION_DISCOVERY',
    statusField: 'federationDiscoveryStatus',
    nextAction: 'Run 14330_FederationTopologyProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_FEDERATION_BACKEND.executeFederationPlan(cfg);
}

function sciipTest14320_FederationDiscoveryProcessor() {
  var result = sciipRun14320_FederationDiscoveryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14320_FederationDiscoveryProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 12210_BusinessKeyIndexRegistryProcessor
 */
function sciipRun12210_BusinessKeyIndexRegistryProcessor() {
  var cfg = {
    processorNumber: 12210,
    processorName: 'BusinessKeyIndexRegistry',
    component: 'Distributed Index Engine',
    sourceSheet: 'DISTRIBUTED_INDEX_READINESS',
    targetSheet: 'BUSINESS_KEY_INDEX_REGISTRY',
    statusField: 'businessKeyIndexRegistryStatus',
    nextAction: 'Run 12220_GlobalLookupContractProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12210_BusinessKeyIndexRegistryProcessor() {
  var result = sciipRun12210_BusinessKeyIndexRegistryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12210_BusinessKeyIndexRegistryProcessor', result: result }));
  return result;
}

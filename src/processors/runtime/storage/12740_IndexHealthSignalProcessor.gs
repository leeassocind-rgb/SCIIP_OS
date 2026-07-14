/**
 * SCIIP_OS v6.0 — 12740_IndexHealthSignalProcessor
 */
function sciipRun12740_IndexHealthSignalProcessor() {
  var cfg = {
    processorNumber: 12740,
    processorName: 'IndexHealthSignal',
    component: 'Cluster Health Monitor',
    sourceSheet: 'LEDGER_HEALTH_SIGNAL',
    targetSheet: 'INDEX_HEALTH_SIGNAL',
    statusField: 'indexHealthSignalStatus',
    nextAction: 'Run 12750_ArchiveHealthSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12740_IndexHealthSignalProcessor() {
  var result = sciipRun12740_IndexHealthSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12740_IndexHealthSignalProcessor', result: result }));
  return result;
}

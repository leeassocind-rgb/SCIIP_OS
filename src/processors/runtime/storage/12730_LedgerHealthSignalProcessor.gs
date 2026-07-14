/**
 * SCIIP_OS v6.0 — 12730_LedgerHealthSignalProcessor
 */
function sciipRun12730_LedgerHealthSignalProcessor() {
  var cfg = {
    processorNumber: 12730,
    processorName: 'LedgerHealthSignal',
    component: 'Cluster Health Monitor',
    sourceSheet: 'SHARD_HEALTH_SIGNAL',
    targetSheet: 'LEDGER_HEALTH_SIGNAL',
    statusField: 'ledgerHealthSignalStatus',
    nextAction: 'Run 12740_IndexHealthSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12730_LedgerHealthSignalProcessor() {
  var result = sciipRun12730_LedgerHealthSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12730_LedgerHealthSignalProcessor', result: result }));
  return result;
}

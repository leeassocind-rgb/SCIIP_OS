function sciipRun13630_LedgerMetricSignalProcessor() {
  var cfg = {
    processorNumber: 13630,
    processorName: 'LedgerMetricSignal',
    component: 'Storage Observability Execution',
    backendLayer: 'Storage Observability',
    sourceSheet: 'SHARD_METRIC_SIGNAL',
    targetSheet: 'LEDGER_METRIC_SIGNAL',
    statusField: 'ledgerMetricSignalStatus',
    nextAction: 'Run 13640_IndexMetricSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13630_LedgerMetricSignalProcessor() {
  var result = sciipRun13630_LedgerMetricSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13630_LedgerMetricSignalProcessor', result: result }));
  return result;
}

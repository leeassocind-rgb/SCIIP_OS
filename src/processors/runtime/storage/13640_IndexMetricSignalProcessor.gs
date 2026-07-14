function sciipRun13640_IndexMetricSignalProcessor() {
  var cfg = {
    processorNumber: 13640,
    processorName: 'IndexMetricSignal',
    component: 'Storage Observability Execution',
    backendLayer: 'Storage Observability',
    sourceSheet: 'LEDGER_METRIC_SIGNAL',
    targetSheet: 'INDEX_METRIC_SIGNAL',
    statusField: 'indexMetricSignalStatus',
    nextAction: 'Run 13650_ArchiveMetricSignalProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13640_IndexMetricSignalProcessor() {
  var result = sciipRun13640_IndexMetricSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13640_IndexMetricSignalProcessor', result: result }));
  return result;
}

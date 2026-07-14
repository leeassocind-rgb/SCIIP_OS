function sciipRun13650_ArchiveMetricSignalProcessor() {
  var cfg = {
    processorNumber: 13650,
    processorName: 'ArchiveMetricSignal',
    component: 'Storage Observability Execution',
    backendLayer: 'Storage Observability',
    sourceSheet: 'INDEX_METRIC_SIGNAL',
    targetSheet: 'ARCHIVE_METRIC_SIGNAL',
    statusField: 'archiveMetricSignalStatus',
    nextAction: 'Run 13660_StorageObservabilityGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13650_ArchiveMetricSignalProcessor() {
  var result = sciipRun13650_ArchiveMetricSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13650_ArchiveMetricSignalProcessor', result: result }));
  return result;
}

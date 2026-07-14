/**
 * SCIIP_OS v6.0 — 12750_ArchiveHealthSignalProcessor
 */
function sciipRun12750_ArchiveHealthSignalProcessor() {
  var cfg = {
    processorNumber: 12750,
    processorName: 'ArchiveHealthSignal',
    component: 'Cluster Health Monitor',
    sourceSheet: 'INDEX_HEALTH_SIGNAL',
    targetSheet: 'ARCHIVE_HEALTH_SIGNAL',
    statusField: 'archiveHealthSignalStatus',
    nextAction: 'Run 12760_ClusterHealthGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12750_ArchiveHealthSignalProcessor() {
  var result = sciipRun12750_ArchiveHealthSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12750_ArchiveHealthSignalProcessor', result: result }));
  return result;
}

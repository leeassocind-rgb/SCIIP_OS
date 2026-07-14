function sciipRun13430_ArchivePartitionIntentProcessor() {
  var cfg = {
    processorNumber: 13430,
    processorName: 'ArchivePartitionIntent',
    component: 'Archive Backend Execution',
    backendLayer: 'Archive Backend',
    sourceSheet: 'COLD_STORAGE_INTENT',
    targetSheet: 'ARCHIVE_PARTITION_INTENT',
    statusField: 'archivePartitionIntentStatus',
    nextAction: 'Run 13440_ArchiveRetrievalBackendIntentProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13430_ArchivePartitionIntentProcessor() {
  var result = sciipRun13430_ArchivePartitionIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13430_ArchivePartitionIntentProcessor', result: result }));
  return result;
}

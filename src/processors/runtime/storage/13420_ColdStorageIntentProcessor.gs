function sciipRun13420_ColdStorageIntentProcessor() {
  var cfg = {
    processorNumber: 13420,
    processorName: 'ColdStorageIntent',
    component: 'Archive Backend Execution',
    backendLayer: 'Archive Backend',
    sourceSheet: 'ARCHIVE_BACKEND_CONTRACT',
    targetSheet: 'COLD_STORAGE_INTENT',
    statusField: 'coldStorageIntentStatus',
    nextAction: 'Run 13430_ArchivePartitionIntentProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13420_ColdStorageIntentProcessor() {
  var result = sciipRun13420_ColdStorageIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13420_ColdStorageIntentProcessor', result: result }));
  return result;
}

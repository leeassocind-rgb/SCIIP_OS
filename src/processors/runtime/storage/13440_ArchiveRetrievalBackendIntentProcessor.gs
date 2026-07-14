function sciipRun13440_ArchiveRetrievalBackendIntentProcessor() {
  var cfg = {
    processorNumber: 13440,
    processorName: 'ArchiveRetrievalBackendIntent',
    component: 'Archive Backend Execution',
    backendLayer: 'Archive Backend',
    sourceSheet: 'ARCHIVE_PARTITION_INTENT',
    targetSheet: 'ARCHIVE_RETRIEVAL_BACKEND_INTENT',
    statusField: 'archiveRetrievalBackendIntentStatus',
    nextAction: 'Run 13450_ArchiveBackendRetentionPolicyProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13440_ArchiveRetrievalBackendIntentProcessor() {
  var result = sciipRun13440_ArchiveRetrievalBackendIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13440_ArchiveRetrievalBackendIntentProcessor', result: result }));
  return result;
}

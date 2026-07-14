function sciipRun13750_ArchiveFailoverPlanProcessor() {
  var cfg = {
    processorNumber: 13750,
    processorName: 'ArchiveFailoverPlan',
    component: 'Storage Failover Execution',
    backendLayer: 'Storage Failover',
    sourceSheet: 'INDEX_FAILOVER_PLAN',
    targetSheet: 'ARCHIVE_FAILOVER_PLAN',
    statusField: 'archiveFailoverPlanStatus',
    nextAction: 'Run 13760_StorageFailoverGovernanceProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13750_ArchiveFailoverPlanProcessor() {
  var result = sciipRun13750_ArchiveFailoverPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13750_ArchiveFailoverPlanProcessor', result: result }));
  return result;
}

function sciipRun13740_IndexFailoverPlanProcessor() {
  var cfg = {
    processorNumber: 13740,
    processorName: 'IndexFailoverPlan',
    component: 'Storage Failover Execution',
    backendLayer: 'Storage Failover',
    sourceSheet: 'LEDGER_FAILOVER_PLAN',
    targetSheet: 'INDEX_FAILOVER_PLAN',
    statusField: 'indexFailoverPlanStatus',
    nextAction: 'Run 13750_ArchiveFailoverPlanProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13740_IndexFailoverPlanProcessor() {
  var result = sciipRun13740_IndexFailoverPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13740_IndexFailoverPlanProcessor', result: result }));
  return result;
}

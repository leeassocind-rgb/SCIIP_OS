function sciipRun13730_LedgerFailoverPlanProcessor() {
  var cfg = {
    processorNumber: 13730,
    processorName: 'LedgerFailoverPlan',
    component: 'Storage Failover Execution',
    backendLayer: 'Storage Failover',
    sourceSheet: 'SHARD_FAILOVER_PLAN',
    targetSheet: 'LEDGER_FAILOVER_PLAN',
    statusField: 'ledgerFailoverPlanStatus',
    nextAction: 'Run 13740_IndexFailoverPlanProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13730_LedgerFailoverPlanProcessor() {
  var result = sciipRun13730_LedgerFailoverPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13730_LedgerFailoverPlanProcessor', result: result }));
  return result;
}

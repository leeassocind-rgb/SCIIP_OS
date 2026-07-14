function sciipRun13220_LedgerPartitionIntentProcessor() {
  var cfg = {
    processorNumber: 13220,
    processorName: 'LedgerPartitionIntent',
    component: 'Ledger Backend Execution',
    backendLayer: 'Ledger Backend',
    sourceSheet: 'LEDGER_BACKEND_CONTRACT',
    targetSheet: 'LEDGER_PARTITION_INTENT',
    statusField: 'ledgerPartitionIntentStatus',
    nextAction: 'Run 13230_LedgerAppendBackendIntentProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13220_LedgerPartitionIntentProcessor() {
  var result = sciipRun13220_LedgerPartitionIntentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13220_LedgerPartitionIntentProcessor', result: result }));
  return result;
}

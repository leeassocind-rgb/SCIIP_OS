function sciipRun13340_TransactionBackendIndexProcessor() {
  var cfg = {
    processorNumber: 13340,
    processorName: 'TransactionBackendIndex',
    component: 'Index Backend Execution',
    backendLayer: 'Index Backend',
    sourceSheet: 'PROCESSOR_BACKEND_INDEX',
    targetSheet: 'TRANSACTION_BACKEND_INDEX',
    statusField: 'transactionBackendIndexStatus',
    nextAction: 'Run 13350_IndexBackendConsistencyPolicyProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13340_TransactionBackendIndexProcessor() {
  var result = sciipRun13340_TransactionBackendIndexProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13340_TransactionBackendIndexProcessor', result: result }));
  return result;
}

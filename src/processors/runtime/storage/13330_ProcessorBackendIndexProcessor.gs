function sciipRun13330_ProcessorBackendIndexProcessor() {
  var cfg = {
    processorNumber: 13330,
    processorName: 'ProcessorBackendIndex',
    component: 'Index Backend Execution',
    backendLayer: 'Index Backend',
    sourceSheet: 'BUSINESS_KEY_BACKEND_INDEX',
    targetSheet: 'PROCESSOR_BACKEND_INDEX',
    statusField: 'processorBackendIndexStatus',
    nextAction: 'Run 13340_TransactionBackendIndexProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13330_ProcessorBackendIndexProcessor() {
  var result = sciipRun13330_ProcessorBackendIndexProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13330_ProcessorBackendIndexProcessor', result: result }));
  return result;
}

function sciipRun13320_BusinessKeyBackendIndexProcessor() {
  var cfg = {
    processorNumber: 13320,
    processorName: 'BusinessKeyBackendIndex',
    component: 'Index Backend Execution',
    backendLayer: 'Index Backend',
    sourceSheet: 'INDEX_BACKEND_CONTRACT',
    targetSheet: 'BUSINESS_KEY_BACKEND_INDEX',
    statusField: 'businessKeyBackendIndexStatus',
    nextAction: 'Run 13330_ProcessorBackendIndexProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13320_BusinessKeyBackendIndexProcessor() {
  var result = sciipRun13320_BusinessKeyBackendIndexProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13320_BusinessKeyBackendIndexProcessor', result: result }));
  return result;
}

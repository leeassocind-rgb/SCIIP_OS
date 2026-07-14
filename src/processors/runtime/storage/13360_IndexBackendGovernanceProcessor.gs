function sciipRun13360_IndexBackendGovernanceProcessor() {
  var cfg = {
    processorNumber: 13360,
    processorName: 'IndexBackendGovernance',
    component: 'Index Backend Execution',
    backendLayer: 'Index Backend',
    sourceSheet: 'INDEX_BACKEND_CONSISTENCY_POLICY',
    targetSheet: 'INDEX_BACKEND_GOVERNANCE',
    statusField: 'indexBackendGovernanceStatus',
    nextAction: 'Run 13370_IndexBackendValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13360_IndexBackendGovernanceProcessor() {
  var result = sciipRun13360_IndexBackendGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13360_IndexBackendGovernanceProcessor', result: result }));
  return result;
}

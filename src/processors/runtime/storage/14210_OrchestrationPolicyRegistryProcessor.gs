/**
 * SCIIP_OS v6.0 — 14210_OrchestrationPolicyRegistryProcessor
 */
function sciipRun14210_OrchestrationPolicyRegistryProcessor() {
  var cfg = {
    processorNumber: 14210,
    processorName: 'OrchestrationPolicyRegistry',
    component: 'Storage Orchestration Execution',
    backendLayer: 'Storage Orchestration',
    sourceSheet: 'STORAGE_ORCHESTRATION_READINESS',
    targetSheet: 'ORCHESTRATION_POLICY_REGISTRY',
    statusField: 'orchestrationPolicyRegistryStatus',
    nextAction: 'Run 14220_OrchestrationDiscoveryProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ORCHESTRATION_BACKEND.executeOrchestrationPlan(cfg);
}

function sciipTest14210_OrchestrationPolicyRegistryProcessor() {
  var result = sciipRun14210_OrchestrationPolicyRegistryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14210_OrchestrationPolicyRegistryProcessor', result: result }));
  return result;
}

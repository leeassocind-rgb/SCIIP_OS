/**
 * SCIIP_OS v6.0 — 14220_OrchestrationDiscoveryProcessor
 */
function sciipRun14220_OrchestrationDiscoveryProcessor() {
  var cfg = {
    processorNumber: 14220,
    processorName: 'OrchestrationDiscovery',
    component: 'Storage Orchestration Execution',
    backendLayer: 'Storage Orchestration',
    sourceSheet: 'ORCHESTRATION_POLICY_REGISTRY',
    targetSheet: 'ORCHESTRATION_DISCOVERY',
    statusField: 'orchestrationDiscoveryStatus',
    nextAction: 'Run 14230_OrchestrationPlanningProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_ORCHESTRATION_BACKEND.executeOrchestrationPlan(cfg);
}

function sciipTest14220_OrchestrationDiscoveryProcessor() {
  var result = sciipRun14220_OrchestrationDiscoveryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14220_OrchestrationDiscoveryProcessor', result: result }));
  return result;
}

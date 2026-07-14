/**
 * SCIIP_OS v6.0 — 13920_SynchronizationDiscoveryProcessor
 */
function sciipRun13920_SynchronizationDiscoveryProcessor() {
  var cfg = {
    processorNumber: 13920,
    processorName: 'SynchronizationDiscovery',
    component: 'Storage Synchronization Execution',
    backendLayer: 'Storage Synchronization',
    sourceSheet: 'SYNCHRONIZATION_POLICY_REGISTRY',
    targetSheet: 'SYNCHRONIZATION_DISCOVERY',
    statusField: 'synchronizationDiscoveryStatus',
    nextAction: 'Run 13930_SynchronizationPlanningProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_SYNCHRONIZATION_BACKEND.executeSynchronizationPlan(cfg);
}

function sciipTest13920_SynchronizationDiscoveryProcessor() {
  var result = sciipRun13920_SynchronizationDiscoveryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13920_SynchronizationDiscoveryProcessor', result: result }));
  return result;
}

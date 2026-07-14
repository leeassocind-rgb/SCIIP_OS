/**
 * SCIIP_OS v6.0 — 14630_LoadDistributionProcessor
 */
function sciipRun14630_LoadDistributionProcessor() {
  var cfg = {
    processorNumber: 14630,
    processorName: 'LoadDistribution',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'CAPACITY_ANALYSIS',
    targetSheet: 'LOAD_DISTRIBUTION',
    statusField: 'loadDistributionStatus',
    nextAction: 'Run 14640_RebalancePlanningProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14630_LoadDistributionProcessor() {
  var result = sciipRun14630_LoadDistributionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14630_LoadDistributionProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 14640_RebalancePlanningProcessor
 */
function sciipRun14640_RebalancePlanningProcessor() {
  var cfg = {
    processorNumber: 14640,
    processorName: 'RebalancePlanning',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'LOAD_DISTRIBUTION',
    targetSheet: 'REBALANCE_PLANNING',
    statusField: 'rebalancePlanningStatus',
    nextAction: 'Run 14650_RebalanceExecutionProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14640_RebalancePlanningProcessor() {
  var result = sciipRun14640_RebalancePlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14640_RebalancePlanningProcessor', result: result }));
  return result;
}

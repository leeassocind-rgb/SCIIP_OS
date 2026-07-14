/**
 * SCIIP_OS v6.0 — 14650_RebalanceExecutionProcessor
 */
function sciipRun14650_RebalanceExecutionProcessor() {
  var cfg = {
    processorNumber: 14650,
    processorName: 'RebalanceExecution',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'REBALANCE_PLANNING',
    targetSheet: 'REBALANCE_EXECUTION',
    statusField: 'rebalanceExecutionStatus',
    nextAction: 'Run 14660_BalancingLedgerProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14650_RebalanceExecutionProcessor() {
  var result = sciipRun14650_RebalanceExecutionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14650_RebalanceExecutionProcessor', result: result }));
  return result;
}

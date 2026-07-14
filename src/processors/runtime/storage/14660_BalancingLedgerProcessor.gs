/**
 * SCIIP_OS v6.0 — 14660_BalancingLedgerProcessor
 */
function sciipRun14660_BalancingLedgerProcessor() {
  var cfg = {
    processorNumber: 14660,
    processorName: 'BalancingLedger',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'REBALANCE_EXECUTION',
    targetSheet: 'BALANCING_LEDGER',
    statusField: 'balancingLedgerStatus',
    nextAction: 'Run 14670_BalancingValidationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14660_BalancingLedgerProcessor() {
  var result = sciipRun14660_BalancingLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14660_BalancingLedgerProcessor', result: result }));
  return result;
}

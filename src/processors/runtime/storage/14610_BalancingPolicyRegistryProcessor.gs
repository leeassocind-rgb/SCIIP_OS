/**
 * SCIIP_OS v6.0 — 14610_BalancingPolicyRegistryProcessor
 */
function sciipRun14610_BalancingPolicyRegistryProcessor() {
  var cfg = {
    processorNumber: 14610,
    processorName: 'BalancingPolicyRegistry',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'STORAGE_BALANCING_READINESS',
    targetSheet: 'BALANCING_POLICY_REGISTRY',
    statusField: 'balancingPolicyRegistryStatus',
    nextAction: 'Run 14620_CapacityAnalysisProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14610_BalancingPolicyRegistryProcessor() {
  var result = sciipRun14610_BalancingPolicyRegistryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14610_BalancingPolicyRegistryProcessor', result: result }));
  return result;
}

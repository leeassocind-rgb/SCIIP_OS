/**
 * SCIIP_OS v6.0 — 14620_CapacityAnalysisProcessor
 */
function sciipRun14620_CapacityAnalysisProcessor() {
  var cfg = {
    processorNumber: 14620,
    processorName: 'CapacityAnalysis',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'BALANCING_POLICY_REGISTRY',
    targetSheet: 'CAPACITY_ANALYSIS',
    statusField: 'capacityAnalysisStatus',
    nextAction: 'Run 14630_LoadDistributionProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14620_CapacityAnalysisProcessor() {
  var result = sciipRun14620_CapacityAnalysisProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14620_CapacityAnalysisProcessor', result: result }));
  return result;
}

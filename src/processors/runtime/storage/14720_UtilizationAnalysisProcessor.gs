/**
 * SCIIP_OS v6.0 — 14720 UtilizationAnalysis
 *
 * Capacity-safe Storage Optimization Execution processor.
 */
function sciipRun14720_UtilizationAnalysisProcessor() {
  return SCIIP_STORAGE_OPTIMIZATION_BACKEND.executeOptimizationPlan({
    processorNumber: 14720,
    processorName: 'UtilizationAnalysis',
    statusField: 'utilizationAnalysisStatus',
    component: 'Storage Optimization Execution',
    backendLayer: 'Storage Optimization',
    sourceSheet: 'OPTIMIZATION_POLICY_REGISTRY',
    targetSheet: 'UTILIZATION_ANALYSIS',
    nextAction: 'Run 14730_HotspotIdentificationProcessor after this processor completes.'
  });
}

function sciipTest14720_UtilizationAnalysisProcessor() {
  var result = sciipRun14720_UtilizationAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest14720_UtilizationAnalysisProcessor',
    result: result
  }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 14730 HotspotIdentification
 *
 * Capacity-safe Storage Optimization Execution processor.
 */
function sciipRun14730_HotspotIdentificationProcessor() {
  return SCIIP_STORAGE_OPTIMIZATION_BACKEND.executeOptimizationPlan({
    processorNumber: 14730,
    processorName: 'HotspotIdentification',
    statusField: 'hotspotIdentificationStatus',
    component: 'Storage Optimization Execution',
    backendLayer: 'Storage Optimization',
    sourceSheet: 'UTILIZATION_ANALYSIS',
    targetSheet: 'HOTSPOT_IDENTIFICATION',
    nextAction: 'Run 14740_OptimizationPlanningProcessor after this processor completes.'
  });
}

function sciipTest14730_HotspotIdentificationProcessor() {
  var result = sciipRun14730_HotspotIdentificationProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest14730_HotspotIdentificationProcessor',
    result: result
  }));
  return result;
}

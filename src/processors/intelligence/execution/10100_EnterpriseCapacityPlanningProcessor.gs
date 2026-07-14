/**
 * SCIIP_OS v5.5 — 10100_EnterpriseCapacityPlanningProcessor
 */
function sciipRun10100_EnterpriseCapacityPlanningProcessor() {
  var cfg = {
    processorNumber: 10100,
    processorName: 'EnterpriseCapacityPlanning',
    layer: 'Enterprise Capacity Planning',
    sourceSheet: 'ENTERPRISE_CAPACITY_MEASUREMENT',
    targetSheet: 'ENTERPRISE_CAPACITY_PLANNING',
    statusField: 'enterpriseCapacityPlanningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Capacity Planning completed for Enterprise Capacity Execution.',
    nextAction: 'Run 10110_EnterpriseCapacityOptimizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_CAPACITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10100_EnterpriseCapacityPlanningProcessor() {
  var result = sciipRun10100_EnterpriseCapacityPlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10100_EnterpriseCapacityPlanningProcessor', result: result }));
  return result;
}

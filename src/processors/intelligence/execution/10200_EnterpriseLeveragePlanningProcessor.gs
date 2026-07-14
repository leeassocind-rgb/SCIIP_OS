/**
 * SCIIP_OS v5.5 — 10200_EnterpriseLeveragePlanningProcessor
 */
function sciipRun10200_EnterpriseLeveragePlanningProcessor() {
  var cfg = {
    processorNumber: 10200,
    processorName: 'EnterpriseLeveragePlanning',
    layer: 'Enterprise Leverage Planning',
    sourceSheet: 'ENTERPRISE_LEVERAGE_MEASUREMENT',
    targetSheet: 'ENTERPRISE_LEVERAGE_PLANNING',
    statusField: 'enterpriseLeveragePlanningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Leverage Planning completed for Enterprise Leverage Execution.',
    nextAction: 'Run 10210_EnterpriseLeverageOptimizationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_LEVERAGE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10200_EnterpriseLeveragePlanningProcessor() {
  var result = sciipRun10200_EnterpriseLeveragePlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10200_EnterpriseLeveragePlanningProcessor', result: result }));
  return result;
}

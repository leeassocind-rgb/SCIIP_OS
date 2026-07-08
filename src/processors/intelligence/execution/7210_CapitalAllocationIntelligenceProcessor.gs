/**
 * SCIIP_OS v5.5 — 7210_CapitalAllocationIntelligenceProcessor
 * Creates capital allocation intelligence from portfolio strategy outputs.
 */
function sciipRun7210_CapitalAllocationIntelligenceProcessor() {
  var cfg = {
    processorNumber: 7210,
    processorName: 'CapitalAllocationIntelligence',
    layer: 'Capital Allocation Intelligence',
    sourceSheet: 'PORTFOLIO_STRATEGY_INTELLIGENCE',
    targetSheet: 'CAPITAL_ALLOCATION_INTELLIGENCE',
    statusField: 'capitalAllocationIntelligenceStatus',
    requiresSource: false,
    recommendation: 'Capital Allocation Intelligence produced for strategic review.',
    successMessage: 'Creates capital allocation intelligence from portfolio strategy outputs.',
    nextAction: 'Run 7220_StrategicRecommendationEngineProcessor after this processor completes.'
  };
  return SCIIP_STRATEGIC_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7210_CapitalAllocationIntelligenceProcessor() {
  var result = sciipRun7210_CapitalAllocationIntelligenceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7210_CapitalAllocationIntelligenceProcessor', result: result }));
  return result;
}

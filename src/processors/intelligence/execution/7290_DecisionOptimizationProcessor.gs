/**
 * SCIIP_OS v5.5 — 7290_DecisionOptimizationProcessor
 * Optimizes scenario outputs into ranked decision pathways.
 */
function sciipRun7290_DecisionOptimizationProcessor() {
  var cfg = {
    processorNumber: 7290,
    processorName: 'DecisionOptimization',
    layer: 'Decision Optimization',
    sourceSheet: 'MULTI_SCENARIO_ANALYSIS',
    targetSheet: 'DECISION_OPTIMIZATION',
    statusField: 'decisionOptimizationStatus',
    requiresSource: false,
    recommendedDecision: 'Decision Optimization produced for decision review.',
    successMessage: 'Optimizes scenario outputs into ranked decision pathways.',
    nextAction: 'Run 7300_CapitalAllocationDecisionProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7290_DecisionOptimizationProcessor() {
  var result = sciipRun7290_DecisionOptimizationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7290_DecisionOptimizationProcessor', result: result }));
  return result;
}

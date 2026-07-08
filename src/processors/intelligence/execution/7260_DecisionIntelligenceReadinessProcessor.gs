/**
 * SCIIP_OS v5.5 — 7260_DecisionIntelligenceReadinessProcessor
 * Confirms strategic intelligence outputs are available for decision intelligence execution.
 */
function sciipRun7260_DecisionIntelligenceReadinessProcessor() {
  var cfg = {
    processorNumber: 7260,
    processorName: 'DecisionIntelligenceReadiness',
    layer: 'Decision Intelligence Readiness',
    sourceSheet: 'STRATEGIC_INTELLIGENCE_ACCEPTANCES',
    targetSheet: 'DECISION_INTELLIGENCE_READINESS',
    statusField: 'decisionReadinessStatus',
    requiresSource: false,
    recommendedDecision: 'Decision Intelligence Readiness produced for decision review.',
    successMessage: 'Confirms strategic intelligence outputs are available for decision intelligence execution.',
    nextAction: 'Run 7270_DecisionContextAssemblyProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7260_DecisionIntelligenceReadinessProcessor() {
  var result = sciipRun7260_DecisionIntelligenceReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7260_DecisionIntelligenceReadinessProcessor', result: result }));
  return result;
}

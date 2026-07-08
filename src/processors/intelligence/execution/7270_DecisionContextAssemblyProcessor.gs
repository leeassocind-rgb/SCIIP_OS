/**
 * SCIIP_OS v5.5 — 7270_DecisionContextAssemblyProcessor
 * Assembles executive and strategic context for decision intelligence.
 */
function sciipRun7270_DecisionContextAssemblyProcessor() {
  var cfg = {
    processorNumber: 7270,
    processorName: 'DecisionContextAssembly',
    layer: 'Decision Context Assembly',
    sourceSheet: 'DECISION_INTELLIGENCE_READINESS',
    targetSheet: 'DECISION_CONTEXT_ASSEMBLY',
    statusField: 'decisionContextAssemblyStatus',
    requiresSource: false,
    recommendedDecision: 'Decision Context Assembly produced for decision review.',
    successMessage: 'Assembles executive and strategic context for decision intelligence.',
    nextAction: 'Run 7280_MultiScenarioAnalysisProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7270_DecisionContextAssemblyProcessor() {
  var result = sciipRun7270_DecisionContextAssemblyProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7270_DecisionContextAssemblyProcessor', result: result }));
  return result;
}

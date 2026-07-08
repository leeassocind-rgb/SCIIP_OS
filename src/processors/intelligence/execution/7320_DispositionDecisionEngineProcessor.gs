/**
 * SCIIP_OS v5.5 — 7320_DispositionDecisionEngineProcessor
 * Creates disposition decision intelligence from acquisition and capital strategy outputs.
 */
function sciipRun7320_DispositionDecisionEngineProcessor() {
  var cfg = {
    processorNumber: 7320,
    processorName: 'DispositionDecisionEngine',
    layer: 'Disposition Decision Engine',
    sourceSheet: 'ACQUISITION_DECISION_ENGINE',
    targetSheet: 'DISPOSITION_DECISION_ENGINE',
    statusField: 'dispositionDecisionEngineStatus',
    requiresSource: false,
    recommendedDecision: 'Disposition Decision Engine produced for decision review.',
    successMessage: 'Creates disposition decision intelligence from acquisition and capital strategy outputs.',
    nextAction: 'Run 7330_DecisionValidationProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7320_DispositionDecisionEngineProcessor() {
  var result = sciipRun7320_DispositionDecisionEngineProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7320_DispositionDecisionEngineProcessor', result: result }));
  return result;
}

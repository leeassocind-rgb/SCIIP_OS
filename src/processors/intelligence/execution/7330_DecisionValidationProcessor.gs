/**
 * SCIIP_OS v5.5 — 7330_DecisionValidationProcessor
 * Validates decision intelligence outputs before certification.
 */
function sciipRun7330_DecisionValidationProcessor() {
  var cfg = {
    processorNumber: 7330,
    processorName: 'DecisionValidation',
    layer: 'Decision Validation',
    sourceSheet: 'DISPOSITION_DECISION_ENGINE',
    targetSheet: 'DECISION_VALIDATIONS',
    statusField: 'decisionValidationStatus',
    requiresSource: false,
    recommendedDecision: 'Decision Validation produced for decision review.',
    successMessage: 'Validates decision intelligence outputs before certification.',
    nextAction: 'Run 7340_DecisionCertificationProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7330_DecisionValidationProcessor() {
  var result = sciipRun7330_DecisionValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7330_DecisionValidationProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v5.5 — 7350_DecisionAcceptanceProcessor
 * Accepts certified decision intelligence outputs into the permanent decision layer.
 */
function sciipRun7350_DecisionAcceptanceProcessor() {
  var cfg = {
    processorNumber: 7350,
    processorName: 'DecisionAcceptance',
    layer: 'Decision Acceptance',
    sourceSheet: 'DECISION_CERTIFICATIONS',
    targetSheet: 'DECISION_ACCEPTANCES',
    statusField: 'decisionAcceptanceStatus',
    requiresSource: false,
    recommendedDecision: 'Decision Acceptance produced for decision review.',
    successMessage: 'Accepts certified decision intelligence outputs into the permanent decision layer.',
    nextAction: 'Decision Intelligence Execution subsystem accepted through 7350.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7350_DecisionAcceptanceProcessor() {
  var result = sciipRun7350_DecisionAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7350_DecisionAcceptanceProcessor', result: result }));
  return result;
}

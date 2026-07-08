/**
 * SCIIP_OS v5.5 — 7300_CapitalAllocationDecisionProcessor
 * Produces capital allocation decision intelligence from optimized scenarios.
 */
function sciipRun7300_CapitalAllocationDecisionProcessor() {
  var cfg = {
    processorNumber: 7300,
    processorName: 'CapitalAllocationDecision',
    layer: 'Capital Allocation Decision',
    sourceSheet: 'DECISION_OPTIMIZATION',
    targetSheet: 'CAPITAL_ALLOCATION_DECISIONS',
    statusField: 'capitalAllocationDecisionStatus',
    requiresSource: false,
    recommendedDecision: 'Capital Allocation Decision produced for decision review.',
    successMessage: 'Produces capital allocation decision intelligence from optimized scenarios.',
    nextAction: 'Run 7310_AcquisitionDecisionEngineProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7300_CapitalAllocationDecisionProcessor() {
  var result = sciipRun7300_CapitalAllocationDecisionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7300_CapitalAllocationDecisionProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v5.5 — 7310_AcquisitionDecisionEngineProcessor
 * Creates acquisition decision intelligence from capital allocation decisions.
 */
function sciipRun7310_AcquisitionDecisionEngineProcessor() {
  var cfg = {
    processorNumber: 7310,
    processorName: 'AcquisitionDecisionEngine',
    layer: 'Acquisition Decision Engine',
    sourceSheet: 'CAPITAL_ALLOCATION_DECISIONS',
    targetSheet: 'ACQUISITION_DECISION_ENGINE',
    statusField: 'acquisitionDecisionEngineStatus',
    requiresSource: false,
    recommendedDecision: 'Acquisition Decision Engine produced for decision review.',
    successMessage: 'Creates acquisition decision intelligence from capital allocation decisions.',
    nextAction: 'Run 7320_DispositionDecisionEngineProcessor after this processor completes.'
  };
  return SCIIP_DECISION_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7310_AcquisitionDecisionEngineProcessor() {
  var result = sciipRun7310_AcquisitionDecisionEngineProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7310_AcquisitionDecisionEngineProcessor', result: result }));
  return result;
}

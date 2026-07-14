/**
 * SCIIP_OS v5.5 — 8990_EnterpriseOutcomeAttributionProcessor
 */
function sciipRun8990_EnterpriseOutcomeAttributionProcessor() {
  var cfg = {
    processorNumber: 8990,
    processorName: 'EnterpriseOutcomeAttribution',
    layer: 'Enterprise Outcome Attribution',
    sourceSheet: 'ENTERPRISE_OUTCOME_MEASUREMENT',
    targetSheet: 'ENTERPRISE_OUTCOME_ATTRIBUTION',
    statusField: 'enterpriseOutcomeAttributionStatus',
    requiresSource: false,
    successMessage: 'Enterprise Outcome Attribution completed for Enterprise Outcome Execution.',
    nextAction: 'Run 9000_EnterpriseOutcomeScoringProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OUTCOME_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8990_EnterpriseOutcomeAttributionProcessor() {
  var result = sciipRun8990_EnterpriseOutcomeAttributionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8990_EnterpriseOutcomeAttributionProcessor', result: result }));
  return result;
}

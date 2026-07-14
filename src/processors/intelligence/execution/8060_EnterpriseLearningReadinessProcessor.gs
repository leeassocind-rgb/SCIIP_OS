/**
 * SCIIP_OS v5.5 — 8060_EnterpriseLearningReadinessProcessor
 * Enterprise Learning Readiness completed for Enterprise Learning Execution.
 */
function sciipRun8060_EnterpriseLearningReadinessProcessor() {
  var cfg = {
    processorNumber: 8060,
    processorName: 'EnterpriseLearningReadiness',
    layer: 'Enterprise Learning Readiness',
    sourceSheet: 'ENTERPRISE_COGNITIVE_ACCEPTANCES',
    targetSheet: 'ENTERPRISE_LEARNING_READINESS',
    statusField: 'enterpriseLearningReadinessStatus',
    requiresSource: false,
    successMessage: 'Enterprise Learning Readiness completed for Enterprise Learning Execution.',
    nextAction: 'Run 8070_EnterpriseLearningIntakeProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_LEARNING_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8060_EnterpriseLearningReadinessProcessor() {
  var result = sciipRun8060_EnterpriseLearningReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8060_EnterpriseLearningReadinessProcessor', result: result }));
  return result;
}

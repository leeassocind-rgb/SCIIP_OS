/**
 * SCIIP_OS v5.5 — 8070_EnterpriseLearningIntakeProcessor
 * Enterprise Learning Intake completed for Enterprise Learning Execution.
 */
function sciipRun8070_EnterpriseLearningIntakeProcessor() {
  var cfg = {
    processorNumber: 8070,
    processorName: 'EnterpriseLearningIntake',
    layer: 'Enterprise Learning Intake',
    sourceSheet: 'ENTERPRISE_LEARNING_READINESS',
    targetSheet: 'ENTERPRISE_LEARNING_INTAKE',
    statusField: 'enterpriseLearningIntakeStatus',
    requiresSource: false,
    successMessage: 'Enterprise Learning Intake completed for Enterprise Learning Execution.',
    nextAction: 'Run 8080_EnterprisePatternRecognitionProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_LEARNING_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8070_EnterpriseLearningIntakeProcessor() {
  var result = sciipRun8070_EnterpriseLearningIntakeProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8070_EnterpriseLearningIntakeProcessor', result: result }));
  return result;
}

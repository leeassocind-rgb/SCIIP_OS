/**
 * SCIIP_OS v5.5 — 9370_EnterpriseChangeSignalProcessor
 */
function sciipRun9370_EnterpriseChangeSignalProcessor() {
  var cfg = {
    processorNumber: 9370,
    processorName: 'EnterpriseChangeSignal',
    layer: 'Enterprise Change Signal',
    sourceSheet: 'ENTERPRISE_ADAPTATION_READINESS',
    targetSheet: 'ENTERPRISE_CHANGE_SIGNAL',
    statusField: 'enterpriseChangeSignalStatus',
    requiresSource: false,
    successMessage: 'Enterprise Change Signal completed for Enterprise Adaptation Execution.',
    nextAction: 'Run 9380_EnterpriseAdaptationAssessmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_ADAPTATION_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9370_EnterpriseChangeSignalProcessor() {
  var result = sciipRun9370_EnterpriseChangeSignalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9370_EnterpriseChangeSignalProcessor', result: result }));
  return result;
}

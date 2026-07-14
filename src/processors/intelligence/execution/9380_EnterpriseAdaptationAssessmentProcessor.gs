/**
 * SCIIP_OS v5.5 — 9380_EnterpriseAdaptationAssessmentProcessor
 */
function sciipRun9380_EnterpriseAdaptationAssessmentProcessor() {
  var cfg = {
    processorNumber: 9380,
    processorName: 'EnterpriseAdaptationAssessment',
    layer: 'Enterprise Adaptation Assessment',
    sourceSheet: 'ENTERPRISE_CHANGE_SIGNAL',
    targetSheet: 'ENTERPRISE_ADAPTATION_ASSESSMENT',
    statusField: 'enterpriseAdaptationAssessmentStatus',
    requiresSource: false,
    successMessage: 'Enterprise Adaptation Assessment completed for Enterprise Adaptation Execution.',
    nextAction: 'Run 9390_EnterpriseAdaptationPlanningProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_ADAPTATION_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9380_EnterpriseAdaptationAssessmentProcessor() {
  var result = sciipRun9380_EnterpriseAdaptationAssessmentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9380_EnterpriseAdaptationAssessmentProcessor', result: result }));
  return result;
}

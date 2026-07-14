/**
 * SCIIP_OS v5.5 — 9580_EnterpriseInnovationConceptProcessor
 */
function sciipRun9580_EnterpriseInnovationConceptProcessor() {
  var cfg = {
    processorNumber: 9580,
    processorName: 'EnterpriseInnovationConcept',
    layer: 'Enterprise Innovation Concept',
    sourceSheet: 'ENTERPRISE_OPPORTUNITY_DISCOVERY',
    targetSheet: 'ENTERPRISE_INNOVATION_CONCEPT',
    statusField: 'enterpriseInnovationConceptStatus',
    requiresSource: false,
    successMessage: 'Enterprise Innovation Concept completed for Enterprise Innovation Execution.',
    nextAction: 'Run 9590_EnterpriseExperimentDesignProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_INNOVATION_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest9580_EnterpriseInnovationConceptProcessor() {
  var result = sciipRun9580_EnterpriseInnovationConceptProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest9580_EnterpriseInnovationConceptProcessor', result: result }));
  return result;
}

/**
 * SCIIP_OS v5.5 — 8870_EnterpriseObjectiveDefinitionProcessor
 */
function sciipRun8870_EnterpriseObjectiveDefinitionProcessor() {
  var cfg = {
    processorNumber: 8870,
    processorName: 'EnterpriseObjectiveDefinition',
    layer: 'Enterprise Objective Definition',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_READINESS',
    targetSheet: 'ENTERPRISE_OBJECTIVE_DEFINITION',
    statusField: 'enterpriseObjectiveDefinitionStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Definition completed for Enterprise Objective Execution.',
    nextAction: 'Run 8880_EnterpriseObjectiveAlignmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8870_EnterpriseObjectiveDefinitionProcessor() {
  var result = sciipRun8870_EnterpriseObjectiveDefinitionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8870_EnterpriseObjectiveDefinitionProcessor', result: result }));
  return result;
}

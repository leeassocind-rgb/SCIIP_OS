/**
 * SCIIP_OS v5.5 — 8770_EnterpriseMissionDefinitionProcessor
 */
function sciipRun8770_EnterpriseMissionDefinitionProcessor() {
  var cfg = {
    processorNumber: 8770,
    processorName: 'EnterpriseMissionDefinition',
    layer: 'Enterprise Mission Definition',
    sourceSheet: 'ENTERPRISE_MISSION_READINESS',
    targetSheet: 'ENTERPRISE_MISSION_DEFINITION',
    statusField: 'enterpriseMissionDefinitionStatus',
    requiresSource: false,
    successMessage: 'Enterprise Mission Definition completed for Enterprise Mission Execution.',
    nextAction: 'Run 8780_EnterpriseMissionAlignmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_MISSION_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8770_EnterpriseMissionDefinitionProcessor() {
  var result = sciipRun8770_EnterpriseMissionDefinitionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8770_EnterpriseMissionDefinitionProcessor', result: result }));
  return result;
}

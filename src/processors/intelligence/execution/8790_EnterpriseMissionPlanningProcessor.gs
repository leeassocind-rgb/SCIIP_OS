/**
 * SCIIP_OS v5.5 — 8790_EnterpriseMissionPlanningProcessor
 */
function sciipRun8790_EnterpriseMissionPlanningProcessor() {
  var cfg = {
    processorNumber: 8790,
    processorName: 'EnterpriseMissionPlanning',
    layer: 'Enterprise Mission Planning',
    sourceSheet: 'ENTERPRISE_MISSION_ALIGNMENT',
    targetSheet: 'ENTERPRISE_MISSION_PLANNING',
    statusField: 'enterpriseMissionPlanningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Mission Planning completed for Enterprise Mission Execution.',
    nextAction: 'Run 8800_EnterpriseMissionCoordinationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_MISSION_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8790_EnterpriseMissionPlanningProcessor() {
  var result = sciipRun8790_EnterpriseMissionPlanningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8790_EnterpriseMissionPlanningProcessor', result: result }));
  return result;
}

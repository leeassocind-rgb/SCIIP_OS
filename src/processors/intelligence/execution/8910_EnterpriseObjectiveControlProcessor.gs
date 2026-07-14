/**
 * SCIIP_OS v5.5 — 8910_EnterpriseObjectiveControlProcessor
 */
function sciipRun8910_EnterpriseObjectiveControlProcessor() {
  var cfg = {
    processorNumber: 8910,
    processorName: 'EnterpriseObjectiveControl',
    layer: 'Enterprise Objective Control',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_TRACKING',
    targetSheet: 'ENTERPRISE_OBJECTIVE_CONTROL',
    statusField: 'enterpriseObjectiveControlStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Control completed for Enterprise Objective Execution.',
    nextAction: 'Run 8920_EnterpriseObjectiveGovernanceProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8910_EnterpriseObjectiveControlProcessor() {
  var result = sciipRun8910_EnterpriseObjectiveControlProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8910_EnterpriseObjectiveControlProcessor', result: result }));
  return result;
}

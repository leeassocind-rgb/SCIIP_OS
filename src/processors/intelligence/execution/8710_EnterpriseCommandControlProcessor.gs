/**
 * SCIIP_OS v5.5 — 8710_EnterpriseCommandControlProcessor
 */
function sciipRun8710_EnterpriseCommandControlProcessor() {
  var cfg = {
    processorNumber: 8710,
    processorName: 'EnterpriseCommandControl',
    layer: 'Enterprise Command Control',
    sourceSheet: 'ENTERPRISE_COMMAND_AUTHORITY',
    targetSheet: 'ENTERPRISE_COMMAND_CONTROL',
    statusField: 'enterpriseCommandControlStatus',
    requiresSource: false,
    successMessage: 'Enterprise Command Control completed for Enterprise Command Execution.',
    nextAction: 'Run 8720_EnterpriseCommandGovernanceProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_COMMAND_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8710_EnterpriseCommandControlProcessor() {
  var result = sciipRun8710_EnterpriseCommandControlProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8710_EnterpriseCommandControlProcessor', result: result }));
  return result;
}

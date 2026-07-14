/**
 * SCIIP_OS v5.5 — 8700_EnterpriseCommandAuthorityProcessor
 */
function sciipRun8700_EnterpriseCommandAuthorityProcessor() {
  var cfg = {
    processorNumber: 8700,
    processorName: 'EnterpriseCommandAuthority',
    layer: 'Enterprise Command Authority',
    sourceSheet: 'ENTERPRISE_COMMAND_ROUTING',
    targetSheet: 'ENTERPRISE_COMMAND_AUTHORITY',
    statusField: 'enterpriseCommandAuthorityStatus',
    requiresSource: false,
    successMessage: 'Enterprise Command Authority completed for Enterprise Command Execution.',
    nextAction: 'Run 8710_EnterpriseCommandControlProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_COMMAND_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8700_EnterpriseCommandAuthorityProcessor() {
  var result = sciipRun8700_EnterpriseCommandAuthorityProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8700_EnterpriseCommandAuthorityProcessor', result: result }));
  return result;
}

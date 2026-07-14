/**
 * SCIIP_OS v5.5 — 8690_EnterpriseCommandRoutingProcessor
 */
function sciipRun8690_EnterpriseCommandRoutingProcessor() {
  var cfg = {
    processorNumber: 8690,
    processorName: 'EnterpriseCommandRouting',
    layer: 'Enterprise Command Routing',
    sourceSheet: 'ENTERPRISE_COMMAND_PRIORITY',
    targetSheet: 'ENTERPRISE_COMMAND_ROUTING',
    statusField: 'enterpriseCommandRoutingStatus',
    requiresSource: false,
    successMessage: 'Enterprise Command Routing completed for Enterprise Command Execution.',
    nextAction: 'Run 8700_EnterpriseCommandAuthorityProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_COMMAND_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8690_EnterpriseCommandRoutingProcessor() {
  var result = sciipRun8690_EnterpriseCommandRoutingProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8690_EnterpriseCommandRoutingProcessor', result: result }));
  return result;
}

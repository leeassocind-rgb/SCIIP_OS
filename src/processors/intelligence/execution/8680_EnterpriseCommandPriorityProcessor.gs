/**
 * SCIIP_OS v5.5 — 8680_EnterpriseCommandPriorityProcessor
 */
function sciipRun8680_EnterpriseCommandPriorityProcessor() {
  var cfg = {
    processorNumber: 8680,
    processorName: 'EnterpriseCommandPriority',
    layer: 'Enterprise Command Priority',
    sourceSheet: 'ENTERPRISE_COMMAND_INTENT',
    targetSheet: 'ENTERPRISE_COMMAND_PRIORITY',
    statusField: 'enterpriseCommandPriorityStatus',
    requiresSource: false,
    successMessage: 'Enterprise Command Priority completed for Enterprise Command Execution.',
    nextAction: 'Run 8690_EnterpriseCommandRoutingProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_COMMAND_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8680_EnterpriseCommandPriorityProcessor() {
  var result = sciipRun8680_EnterpriseCommandPriorityProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8680_EnterpriseCommandPriorityProcessor', result: result }));
  return result;
}

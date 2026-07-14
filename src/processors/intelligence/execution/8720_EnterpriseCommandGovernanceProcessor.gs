/**
 * SCIIP_OS v5.5 — 8720_EnterpriseCommandGovernanceProcessor
 */
function sciipRun8720_EnterpriseCommandGovernanceProcessor() {
  var cfg = {
    processorNumber: 8720,
    processorName: 'EnterpriseCommandGovernance',
    layer: 'Enterprise Command Governance',
    sourceSheet: 'ENTERPRISE_COMMAND_CONTROL',
    targetSheet: 'ENTERPRISE_COMMAND_GOVERNANCE',
    statusField: 'enterpriseCommandGovernanceStatus',
    requiresSource: false,
    successMessage: 'Enterprise Command Governance completed for Enterprise Command Execution.',
    nextAction: 'Run 8730_EnterpriseCommandValidationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_COMMAND_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8720_EnterpriseCommandGovernanceProcessor() {
  var result = sciipRun8720_EnterpriseCommandGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8720_EnterpriseCommandGovernanceProcessor', result: result }));
  return result;
}

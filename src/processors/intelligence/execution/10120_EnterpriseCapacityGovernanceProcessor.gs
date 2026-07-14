/**
 * SCIIP_OS v5.5 — 10120_EnterpriseCapacityGovernanceProcessor
 */
function sciipRun10120_EnterpriseCapacityGovernanceProcessor() {
  var cfg = {
    processorNumber: 10120,
    processorName: 'EnterpriseCapacityGovernance',
    layer: 'Enterprise Capacity Governance',
    sourceSheet: 'ENTERPRISE_CAPACITY_OPTIMIZATION',
    targetSheet: 'ENTERPRISE_CAPACITY_GOVERNANCE',
    statusField: 'enterpriseCapacityGovernanceStatus',
    requiresSource: false,
    successMessage: 'Enterprise Capacity Governance completed for Enterprise Capacity Execution.',
    nextAction: 'Run 10130_EnterpriseCapacityValidationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_CAPACITY_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest10120_EnterpriseCapacityGovernanceProcessor() {
  var result = sciipRun10120_EnterpriseCapacityGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest10120_EnterpriseCapacityGovernanceProcessor', result: result }));
  return result;
}

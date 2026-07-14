/**
 * SCIIP_OS v5.5 — 8920_EnterpriseObjectiveGovernanceProcessor
 */
function sciipRun8920_EnterpriseObjectiveGovernanceProcessor() {
  var cfg = {
    processorNumber: 8920,
    processorName: 'EnterpriseObjectiveGovernance',
    layer: 'Enterprise Objective Governance',
    sourceSheet: 'ENTERPRISE_OBJECTIVE_CONTROL',
    targetSheet: 'ENTERPRISE_OBJECTIVE_GOVERNANCE',
    statusField: 'enterpriseObjectiveGovernanceStatus',
    requiresSource: false,
    successMessage: 'Enterprise Objective Governance completed for Enterprise Objective Execution.',
    nextAction: 'Run 8930_EnterpriseObjectiveValidationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_OBJECTIVE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8920_EnterpriseObjectiveGovernanceProcessor() {
  var result = sciipRun8920_EnterpriseObjectiveGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8920_EnterpriseObjectiveGovernanceProcessor', result: result }));
  return result;
}

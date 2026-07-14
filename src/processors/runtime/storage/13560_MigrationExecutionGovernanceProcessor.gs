function sciipRun13560_MigrationExecutionGovernanceProcessor() {
  var cfg = {
    processorNumber: 13560,
    processorName: 'MigrationExecutionGovernance',
    component: 'Migration Execution Backend',
    backendLayer: 'Migration Backend',
    sourceSheet: 'MIGRATION_ROLLBACK_EXECUTION',
    targetSheet: 'MIGRATION_EXECUTION_GOVERNANCE',
    statusField: 'migrationExecutionGovernanceStatus',
    nextAction: 'Run 13570_MigrationExecutionValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13560_MigrationExecutionGovernanceProcessor() {
  var result = sciipRun13560_MigrationExecutionGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13560_MigrationExecutionGovernanceProcessor', result: result }));
  return result;
}

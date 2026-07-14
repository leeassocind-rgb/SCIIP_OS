/**
 * SCIIP_OS v6.0 — 14530_MigrationExecutionProcessor
 */
function sciipRun14530_MigrationExecutionProcessor() {
  var cfg = {
    processorNumber: 14530,
    processorName: 'MigrationExecution',
    component: 'Storage Migration Execution',
    backendLayer: 'Storage Migration',
    sourceSheet: 'MIGRATION_PREPARATION',
    targetSheet: 'MIGRATION_EXECUTION',
    statusField: 'migrationExecutionStatus',
    nextAction: 'Run 14540_MigrationVerificationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_MIGRATION_BACKEND.executeMigrationPlan(cfg);
}

function sciipTest14530_MigrationExecutionProcessor() {
  var result = sciipRun14530_MigrationExecutionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14530_MigrationExecutionProcessor', result: result }));
  return result;
}

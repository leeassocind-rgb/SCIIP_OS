function sciipRun13520_MigrationSourceReadPlanProcessor() {
  var cfg = {
    processorNumber: 13520,
    processorName: 'MigrationSourceReadPlan',
    component: 'Migration Execution Backend',
    backendLayer: 'Migration Backend',
    sourceSheet: 'MIGRATION_BATCH_EXECUTION_INTENT',
    targetSheet: 'MIGRATION_SOURCE_READ_PLAN',
    statusField: 'migrationSourceReadPlanStatus',
    nextAction: 'Run 13530_MigrationTargetWritePlanProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13520_MigrationSourceReadPlanProcessor() {
  var result = sciipRun13520_MigrationSourceReadPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13520_MigrationSourceReadPlanProcessor', result: result }));
  return result;
}

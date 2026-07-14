/**
 * SCIIP_OS v6.0 — 12660_MigrationGovernanceProcessor
 */
function sciipRun12660_MigrationGovernanceProcessor() {
  var cfg = {
    processorNumber: 12660,
    processorName: 'MigrationGovernance',
    component: 'Runtime Migration Tools',
    sourceSheet: 'MIGRATION_ROLLBACK_PLAN',
    targetSheet: 'MIGRATION_GOVERNANCE',
    statusField: 'migrationGovernanceStatus',
    nextAction: 'Run 12670_MigrationValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12660_MigrationGovernanceProcessor() {
  var result = sciipRun12660_MigrationGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12660_MigrationGovernanceProcessor', result: result }));
  return result;
}

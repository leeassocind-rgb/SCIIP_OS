/**
 * SCIIP_OS v6.0 — 14560_MigrationLedgerProcessor
 */
function sciipRun14560_MigrationLedgerProcessor() {
  var cfg = {
    processorNumber: 14560,
    processorName: 'MigrationLedger',
    component: 'Storage Migration Execution',
    backendLayer: 'Storage Migration',
    sourceSheet: 'MIGRATION_RECONCILIATION',
    targetSheet: 'MIGRATION_LEDGER',
    statusField: 'migrationLedgerStatus',
    nextAction: 'Run 14570_MigrationValidationProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_MIGRATION_BACKEND.executeMigrationPlan(cfg);
}

function sciipTest14560_MigrationLedgerProcessor() {
  var result = sciipRun14560_MigrationLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14560_MigrationLedgerProcessor', result: result }));
  return result;
}

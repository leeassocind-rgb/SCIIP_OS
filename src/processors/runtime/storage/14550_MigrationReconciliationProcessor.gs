/**
 * SCIIP_OS v6.0 — 14550_MigrationReconciliationProcessor
 */
function sciipRun14550_MigrationReconciliationProcessor() {
  var cfg = {
    processorNumber: 14550,
    processorName: 'MigrationReconciliation',
    component: 'Storage Migration Execution',
    backendLayer: 'Storage Migration',
    sourceSheet: 'MIGRATION_VERIFICATION',
    targetSheet: 'MIGRATION_RECONCILIATION',
    statusField: 'migrationReconciliationStatus',
    nextAction: 'Run 14560_MigrationLedgerProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_MIGRATION_BACKEND.executeMigrationPlan(cfg);
}

function sciipTest14550_MigrationReconciliationProcessor() {
  var result = sciipRun14550_MigrationReconciliationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14550_MigrationReconciliationProcessor', result: result }));
  return result;
}

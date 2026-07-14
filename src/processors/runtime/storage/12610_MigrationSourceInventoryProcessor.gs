/**
 * SCIIP_OS v6.0 — 12610_MigrationSourceInventoryProcessor
 */
function sciipRun12610_MigrationSourceInventoryProcessor() {
  var cfg = {
    processorNumber: 12610,
    processorName: 'MigrationSourceInventory',
    component: 'Runtime Migration Tools',
    sourceSheet: 'MIGRATION_READINESS',
    targetSheet: 'MIGRATION_SOURCE_INVENTORY',
    statusField: 'migrationSourceInventoryStatus',
    nextAction: 'Run 12620_MigrationTargetPlanProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg);
}

function sciipTest12610_MigrationSourceInventoryProcessor() {
  var result = sciipRun12610_MigrationSourceInventoryProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest12610_MigrationSourceInventoryProcessor', result: result }));
  return result;
}

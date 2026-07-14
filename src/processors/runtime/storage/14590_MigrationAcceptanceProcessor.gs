/**
 * SCIIP_OS v6.0 — 14590_MigrationAcceptanceProcessor
 */
function sciipRun14590_MigrationAcceptanceProcessor() {
  var cfg = {
    processorNumber: 14590,
    processorName: 'MigrationAcceptance',
    component: 'Storage Migration Execution',
    backendLayer: 'Storage Migration',
    sourceSheet: 'MIGRATION_CERTIFICATIONS',
    targetSheet: 'MIGRATION_ACCEPTANCES',
    statusField: 'migrationAcceptanceStatus',
    nextAction: 'Storage Migration Execution accepted through 14590.'
  };
  return SCIIP_STORAGE_MIGRATION_BACKEND.executeMigrationPlan(cfg);
}

function sciipTest14590_MigrationAcceptanceProcessor() {
  var result = sciipRun14590_MigrationAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14590_MigrationAcceptanceProcessor', result: result }));
  return result;
}

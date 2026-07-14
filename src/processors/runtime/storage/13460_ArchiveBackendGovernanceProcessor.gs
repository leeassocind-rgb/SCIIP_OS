function sciipRun13460_ArchiveBackendGovernanceProcessor() {
  var cfg = {
    processorNumber: 13460,
    processorName: 'ArchiveBackendGovernance',
    component: 'Archive Backend Execution',
    backendLayer: 'Archive Backend',
    sourceSheet: 'ARCHIVE_BACKEND_RETENTION_POLICY',
    targetSheet: 'ARCHIVE_BACKEND_GOVERNANCE',
    statusField: 'archiveBackendGovernanceStatus',
    nextAction: 'Run 13470_ArchiveBackendValidationProcessor after this processor completes.'
  };
  return SCIIP_DISTRIBUTED_STORAGE_BACKEND.executeBackendPlan(cfg);
}

function sciipTest13460_ArchiveBackendGovernanceProcessor() {
  var result = sciipRun13460_ArchiveBackendGovernanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13460_ArchiveBackendGovernanceProcessor', result: result }));
  return result;
}

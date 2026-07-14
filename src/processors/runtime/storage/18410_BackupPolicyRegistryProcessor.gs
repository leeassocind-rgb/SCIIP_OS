/**
 * SCIIP_OS v6.0 — 18410 BackupPolicyRegistry
 */
function sciipRun18410_BackupPolicyRegistryProcessor() {
  return SCIIP_STORAGE_BACKUP_BACKEND.executeBackupPlan({
    processorNumber: 18410,
    processorName: 'BackupPolicyRegistry',
    statusField: 'backupPolicyRegistryStatus',
    component: 'Storage Backup Execution',
    backendLayer: 'Storage Backup',
    sourceSheet: 'STORAGE_BACKUP_READINESS',
    targetSheet: 'BACKUP_POLICY_REGISTRY',
    nextAction: 'Run 18420_BackupCoverageAssessmentProcessor after this processor completes.'
  });
}

function sciipTest18410_BackupPolicyRegistryProcessor() {
  var result = sciipRun18410_BackupPolicyRegistryProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18410_BackupPolicyRegistryProcessor',
    result: result
  }));
  return result;
}

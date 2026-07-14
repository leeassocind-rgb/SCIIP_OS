/**
 * SCIIP_OS v6.0 — 18430 BackupGapAnalysis
 */
function sciipRun18430_BackupGapAnalysisProcessor() {
  return SCIIP_STORAGE_BACKUP_BACKEND.executeBackupPlan({
    processorNumber: 18430,
    processorName: 'BackupGapAnalysis',
    statusField: 'backupGapAnalysisStatus',
    component: 'Storage Backup Execution',
    backendLayer: 'Storage Backup',
    sourceSheet: 'BACKUP_COVERAGE_ASSESSMENT',
    targetSheet: 'BACKUP_GAP_ANALYSIS',
    nextAction: 'Run 18440_BackupPlanningProcessor after this processor completes.'
  });
}

function sciipTest18430_BackupGapAnalysisProcessor() {
  var result = sciipRun18430_BackupGapAnalysisProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18430_BackupGapAnalysisProcessor',
    result: result
  }));
  return result;
}

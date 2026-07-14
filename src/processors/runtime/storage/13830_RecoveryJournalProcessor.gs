/**
 * SCIIP_OS v6.0 — 13830_RecoveryJournalProcessor
 */
function sciipRun13830_RecoveryJournalProcessor() {
  var cfg = {
    processorNumber: 13830,
    processorName: 'RecoveryJournal',
    component: 'Storage Recovery Execution',
    backendLayer: 'Storage Recovery',
    sourceSheet: 'RECOVERY_CHECKPOINT',
    targetSheet: 'RECOVERY_JOURNAL',
    statusField: 'recoveryJournalStatus',
    nextAction: 'Run 13840_RecoveryReplayPlannerProcessor after this processor completes.'
  };
  return SCIIP_STORAGE_RECOVERY_BACKEND.executeRecoveryPlan(cfg);
}

function sciipTest13830_RecoveryJournalProcessor() {
  var result = sciipRun13830_RecoveryJournalProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest13830_RecoveryJournalProcessor', result: result }));
  return result;
}

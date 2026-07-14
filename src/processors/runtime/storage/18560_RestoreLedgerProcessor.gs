/**
 * SCIIP_OS v6.0 — 18560 RestoreLedger
 */
function sciipRun18560_RestoreLedgerProcessor() {
  return SCIIP_STORAGE_RESTORE_BACKEND.executeRestorePlan({
    processorNumber: 18560,
    processorName: 'RestoreLedger',
    statusField: 'restoreLedgerStatus',
    component: 'Storage Restore Execution',
    backendLayer: 'Storage Restore',
    sourceSheet: 'RESTORE_EXECUTION',
    targetSheet: 'RESTORE_LEDGER',
    nextAction: 'Run 18570_RestoreValidationProcessor after this processor completes.'
  });
}

function sciipTest18560_RestoreLedgerProcessor() {
  var result = sciipRun18560_RestoreLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18560_RestoreLedgerProcessor',
    result: result
  }));
  return result;
}

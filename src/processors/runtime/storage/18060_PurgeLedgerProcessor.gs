/**
 * SCIIP_OS v6.0 — 18060 PurgeLedger
 */
function sciipRun18060_PurgeLedgerProcessor() {
  return SCIIP_STORAGE_PURGE_BACKEND.executePurgePlan({
    processorNumber: 18060,
    processorName: 'PurgeLedger',
    statusField: 'purgeLedgerStatus',
    component: 'Storage Purge Execution',
    backendLayer: 'Storage Purge',
    sourceSheet: 'PURGE_EXECUTION',
    targetSheet: 'PURGE_LEDGER',
    nextAction: 'Run 18070_PurgeValidationProcessor after this processor completes.'
  });
}

function sciipTest18060_PurgeLedgerProcessor() {
  var result = sciipRun18060_PurgeLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18060_PurgeLedgerProcessor',
    result: result
  }));
  return result;
}

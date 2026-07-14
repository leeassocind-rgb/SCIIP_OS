/**
 * SCIIP_OS v6.0 — 18660 CDCLedger
 */
function sciipRun18660_CDCLedgerProcessor() {
  return SCIIP_STORAGE_CDC_BACKEND.executeChangeDataCapturePlan({
    processorNumber: 18660,
    processorName: 'CDCLedger',
    statusField: 'cdcLedgerStatus',
    component: 'Storage Change Data Capture Execution',
    backendLayer: 'Storage Change Data Capture',
    sourceSheet: 'CDC_EXECUTION',
    targetSheet: 'CDC_LEDGER',
    nextAction: 'Run 18670_CDCValidationProcessor after this processor completes.'
  });
}

function sciipTest18660_CDCLedgerProcessor() {
  var result = sciipRun18660_CDCLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest18660_CDCLedgerProcessor',
    result: result
  }));
  return result;
}

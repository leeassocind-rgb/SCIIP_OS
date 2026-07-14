/**
 * SCIIP_OS v6.0 — 28360 StoragePlatformInvestmentLedger
 */
function sciipRun28360_StoragePlatformInvestmentLedgerProcessor() {
  return SCIIP_STORAGE_PLATFORM_INVESTMENT_BACKEND.executePlatformInvestmentPlan({
    processorNumber: 28360,
    processorName: 'StoragePlatformInvestmentLedger',
    statusField: 'storagePlatformInvestmentLedgerStatus',
    component: 'Storage Platform Investment Execution',
    backendLayer: 'Storage Platform Investment',
    sourceSheet: 'STORAGE_PLATFORM_INVESTMENT_EXECUTION',
    targetSheet: 'STORAGE_PLATFORM_INVESTMENT_LEDGER',
    nextAction: 'Run 28370_StoragePlatformInvestmentValidationProcessor after this processor completes.'
  });
}

function sciipTest28360_StoragePlatformInvestmentLedgerProcessor() {
  var result = sciipRun28360_StoragePlatformInvestmentLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest28360_StoragePlatformInvestmentLedgerProcessor',
    result: result
  }));
  return result;
}

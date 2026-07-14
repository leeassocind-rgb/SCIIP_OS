/**
 * SCIIP_OS v6.0 — 27960 StoragePlatformQualityLedger
 */
function sciipRun27960_StoragePlatformQualityLedgerProcessor() {
  return SCIIP_STORAGE_PLATFORM_QUALITY_BACKEND.executePlatformQualityPlan({
    processorNumber: 27960,
    processorName: 'StoragePlatformQualityLedger',
    statusField: 'storagePlatformQualityLedgerStatus',
    component: 'Storage Platform Quality Execution',
    backendLayer: 'Storage Platform Quality',
    sourceSheet: 'STORAGE_PLATFORM_QUALITY_EXECUTION',
    targetSheet: 'STORAGE_PLATFORM_QUALITY_LEDGER',
    nextAction: 'Run 27970_StoragePlatformQualityValidationProcessor after this processor completes.'
  });
}

function sciipTest27960_StoragePlatformQualityLedgerProcessor() {
  var result = sciipRun27960_StoragePlatformQualityLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest27960_StoragePlatformQualityLedgerProcessor',
    result: result
  }));
  return result;
}

/**
 * SCIIP_OS v6.0 — 28390 StoragePlatformInvestmentAcceptance
 */
function sciipRun28390_StoragePlatformInvestmentAcceptanceProcessor() {
  return SCIIP_STORAGE_PLATFORM_INVESTMENT_BACKEND.executePlatformInvestmentPlan({
    processorNumber: 28390,
    processorName: 'StoragePlatformInvestmentAcceptance',
    statusField: 'storagePlatformInvestmentAcceptanceStatus',
    component: 'Storage Platform Investment Execution',
    backendLayer: 'Storage Platform Investment',
    sourceSheet: 'STORAGE_PLATFORM_INVESTMENT_CERTIFICATION',
    targetSheet: 'STORAGE_PLATFORM_INVESTMENT_ACCEPTANCE',
    nextAction: 'Storage Platform Investment Execution accepted through 28390.'
  });
}

function sciipTest28390_StoragePlatformInvestmentAcceptanceProcessor() {
  var result = sciipRun28390_StoragePlatformInvestmentAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest28390_StoragePlatformInvestmentAcceptanceProcessor',
    result: result
  }));
  return result;
}

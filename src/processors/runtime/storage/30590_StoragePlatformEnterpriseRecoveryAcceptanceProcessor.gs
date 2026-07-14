/**
 * SCIIP_OS v6.0 — 30590 StoragePlatformEnterpriseRecoveryAcceptance
 */
function sciipRun30590_StoragePlatformEnterpriseRecoveryAcceptanceProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_RECOVERY_BACKEND.executePlatformEnterpriseRecoveryPlan({
    processorNumber: 30590,
    processorName: 'StoragePlatformEnterpriseRecoveryAcceptance',
    statusField: 'storagePlatformEnterpriseRecoveryAcceptanceStatus',
    component: 'Storage Platform Enterprise Recovery Execution',
    backendLayer: 'Storage Platform Enterprise Recovery',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_RECOVERY_CERTIFICATION',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_RECOVERY_ACCEPTANCE',
    nextAction: 'Storage Platform Enterprise Recovery Execution accepted through 30590.'
  });
}

function sciipTest30590_StoragePlatformEnterpriseRecoveryAcceptanceProcessor() {
  var result = sciipRun30590_StoragePlatformEnterpriseRecoveryAcceptanceProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30590_StoragePlatformEnterpriseRecoveryAcceptanceProcessor',
    result: result
  }));
  return result;
}

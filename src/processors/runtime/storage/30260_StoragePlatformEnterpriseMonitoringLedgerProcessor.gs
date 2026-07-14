/**
 * SCIIP_OS v6.0 — 30260 StoragePlatformEnterpriseMonitoringLedger
 */
function sciipRun30260_StoragePlatformEnterpriseMonitoringLedgerProcessor() {
  return SCIIP_STORAGE_PLATFORM_ENTERPRISE_MONITORING_BACKEND.executePlatformEnterpriseMonitoringPlan({
    processorNumber: 30260,
    processorName: 'StoragePlatformEnterpriseMonitoringLedger',
    statusField: 'storagePlatformEnterpriseMonitoringLedgerStatus',
    component: 'Storage Platform Enterprise Monitoring Execution',
    backendLayer: 'Storage Platform Enterprise Monitoring',
    sourceSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_EXECUTION',
    targetSheet: 'STORAGE_PLATFORM_ENTERPRISE_MONITORING_LEDGER',
    nextAction: 'Run 30270_StoragePlatformEnterpriseMonitoringValidationProcessor after this processor completes.'
  });
}

function sciipTest30260_StoragePlatformEnterpriseMonitoringLedgerProcessor() {
  var result = sciipRun30260_StoragePlatformEnterpriseMonitoringLedgerProcessor();
  console.log(JSON.stringify({
    test: 'sciipTest30260_StoragePlatformEnterpriseMonitoringLedgerProcessor',
    result: result
  }));
  return result;
}

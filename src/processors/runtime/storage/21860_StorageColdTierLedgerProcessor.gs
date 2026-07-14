function sciipRun21860_StorageColdTierLedgerProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21860,processorName:'StorageColdTierLedger',statusField:'storageColdTierLedgerStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_EXECUTION',targetSheet:'STORAGE_COLD_TIER_LEDGER',nextAction:'Run 21870_StorageColdTierValidationProcessor after this processor completes.'});
}
function sciipTest21860_StorageColdTierLedgerProcessor() {
  var result = sciipRun21860_StorageColdTierLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21860_StorageColdTierLedgerProcessor',result:result}));
  return result;
}

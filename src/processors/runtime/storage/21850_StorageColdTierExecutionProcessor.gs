function sciipRun21850_StorageColdTierExecutionProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21850,processorName:'StorageColdTierExecution',statusField:'storageColdTierExecutionStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_PLANNING',targetSheet:'STORAGE_COLD_TIER_EXECUTION',nextAction:'Run 21860_StorageColdTierLedgerProcessor after this processor completes.'});
}
function sciipTest21850_StorageColdTierExecutionProcessor() {
  var result = sciipRun21850_StorageColdTierExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21850_StorageColdTierExecutionProcessor',result:result}));
  return result;
}

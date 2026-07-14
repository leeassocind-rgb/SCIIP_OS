function sciipRun21800_StorageColdTierReadinessProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21800,processorName:'StorageColdTierReadiness',statusField:'storageColdTierReadinessStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'FILE_STORE_ACCEPTANCES',targetSheet:'STORAGE_COLD_TIER_READINESS',nextAction:'Run 21810_StorageColdTierPolicyRegistryProcessor after this processor completes.'});
}
function sciipTest21800_StorageColdTierReadinessProcessor() {
  var result = sciipRun21800_StorageColdTierReadinessProcessor();
  console.log(JSON.stringify({test:'sciipTest21800_StorageColdTierReadinessProcessor',result:result}));
  return result;
}

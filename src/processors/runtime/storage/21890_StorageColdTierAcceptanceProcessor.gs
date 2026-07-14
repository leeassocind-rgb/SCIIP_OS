function sciipRun21890_StorageColdTierAcceptanceProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21890,processorName:'StorageColdTierAcceptance',statusField:'storageColdTierAcceptanceStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_CERTIFICATION',targetSheet:'STORAGE_COLD_TIER_ACCEPTANCE',nextAction:'Storage Cold Tier Execution accepted through 21890.'});
}
function sciipTest21890_StorageColdTierAcceptanceProcessor() {
  var result = sciipRun21890_StorageColdTierAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest21890_StorageColdTierAcceptanceProcessor',result:result}));
  return result;
}

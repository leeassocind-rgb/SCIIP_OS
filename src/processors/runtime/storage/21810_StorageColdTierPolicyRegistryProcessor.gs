function sciipRun21810_StorageColdTierPolicyRegistryProcessor() {
  return SCIIP_STORAGE_COLD_TIER_BACKEND.executeColdTierPlan({processorNumber:21810,processorName:'StorageColdTierPolicyRegistry',statusField:'storageColdTierPolicyRegistryStatus',component:'Storage Cold Tier Execution',backendLayer:'Storage Cold Tier',sourceSheet:'STORAGE_COLD_TIER_READINESS',targetSheet:'STORAGE_COLD_TIER_POLICY_REGISTRY',nextAction:'Run 21820_StorageColdTierCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21810_StorageColdTierPolicyRegistryProcessor() {
  var result = sciipRun21810_StorageColdTierPolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21810_StorageColdTierPolicyRegistryProcessor',result:result}));
  return result;
}

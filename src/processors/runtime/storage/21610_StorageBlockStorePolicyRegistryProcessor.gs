function sciipRun21610_StorageBlockStorePolicyRegistryProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21610,processorName:'StorageBlockStorePolicyRegistry',statusField:'storageBlockStorePolicyRegistryStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'STORAGE_BLOCK_STORE_READINESS',targetSheet:'STORAGE_BLOCK_STORE_POLICY_REGISTRY',nextAction:'Run 21620_StorageBlockStoreCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21610_StorageBlockStorePolicyRegistryProcessor() {
  var result = sciipRun21610_StorageBlockStorePolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21610_StorageBlockStorePolicyRegistryProcessor',result:result}));
  return result;
}

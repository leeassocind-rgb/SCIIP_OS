function sciipRun21510_StorageObjectStorePolicyRegistryProcessor() {
  return SCIIP_STORAGE_OBJECT_STORE_BACKEND.executeObjectStorePlan({processorNumber:21510,processorName:'StorageObjectStorePolicyRegistry',statusField:'storageObjectStorePolicyRegistryStatus',component:'Storage Object Store Execution',backendLayer:'Storage Object Store',sourceSheet:'STORAGE_OBJECT_STORE_READINESS',targetSheet:'STORAGE_OBJECT_STORE_POLICY_REGISTRY',nextAction:'Run 21520_StorageObjectStoreCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21510_StorageObjectStorePolicyRegistryProcessor() {
  var result = sciipRun21510_StorageObjectStorePolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21510_StorageObjectStorePolicyRegistryProcessor',result:result}));
  return result;
}

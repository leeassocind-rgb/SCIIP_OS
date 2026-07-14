function sciipRun21710_StorageFileStorePolicyRegistryProcessor() {
  return SCIIP_STORAGE_FILE_STORE_BACKEND.executeFileStorePlan({processorNumber:21710,processorName:'StorageFileStorePolicyRegistry',statusField:'storageFileStorePolicyRegistryStatus',component:'Storage File Store Execution',backendLayer:'Storage File Store',sourceSheet:'STORAGE_FILE_STORE_READINESS',targetSheet:'STORAGE_FILE_STORE_POLICY_REGISTRY',nextAction:'Run 21720_StorageFileStoreCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21710_StorageFileStorePolicyRegistryProcessor() {
  var result = sciipRun21710_StorageFileStorePolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21710_StorageFileStorePolicyRegistryProcessor',result:result}));
  return result;
}

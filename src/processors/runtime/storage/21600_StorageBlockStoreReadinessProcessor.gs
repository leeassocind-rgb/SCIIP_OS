function sciipRun21600_StorageBlockStoreReadinessProcessor() {
  return SCIIP_STORAGE_BLOCK_STORE_BACKEND.executeBlockStorePlan({processorNumber:21600,processorName:'StorageBlockStoreReadiness',statusField:'storageBlockStoreReadinessStatus',component:'Storage Block Store Execution',backendLayer:'Storage Block Store',sourceSheet:'OBJECT_STORE_ACCEPTANCES',targetSheet:'STORAGE_BLOCK_STORE_READINESS',nextAction:'Run 21610_StorageBlockStorePolicyRegistryProcessor after this processor completes.'});
}
function sciipTest21600_StorageBlockStoreReadinessProcessor() {
  var result = sciipRun21600_StorageBlockStoreReadinessProcessor();
  console.log(JSON.stringify({test:'sciipTest21600_StorageBlockStoreReadinessProcessor',result:result}));
  return result;
}

function sciipRun21410_StorageDataLakehousePolicyRegistryProcessor() {
  return SCIIP_STORAGE_DATA_LAKEHOUSE_BACKEND.executeDataLakehousePlan({processorNumber:21410,processorName:'StorageDataLakehousePolicyRegistry',statusField:'storageDataLakehousePolicyRegistryStatus',component:'Storage Data Lakehouse Execution',backendLayer:'Storage Data Lakehouse',sourceSheet:'STORAGE_DATA_LAKEHOUSE_READINESS',targetSheet:'STORAGE_DATA_LAKEHOUSE_POLICY_REGISTRY',nextAction:'Run 21420_StorageDataLakehouseCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21410_StorageDataLakehousePolicyRegistryProcessor() {
  var result = sciipRun21410_StorageDataLakehousePolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21410_StorageDataLakehousePolicyRegistryProcessor',result:result}));
  return result;
}

function sciipRun21210_StorageFabricPolicyRegistryProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21210,processorName:'StorageFabricPolicyRegistry',statusField:'storageFabricPolicyRegistryStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_READINESS',targetSheet:'STORAGE_FABRIC_POLICY_REGISTRY',nextAction:'Run 21220_StorageFabricCoverageAssessmentProcessor after this processor completes.'});
}
function sciipTest21210_StorageFabricPolicyRegistryProcessor() {
  var result = sciipRun21210_StorageFabricPolicyRegistryProcessor();
  console.log(JSON.stringify({test:'sciipTest21210_StorageFabricPolicyRegistryProcessor',result:result}));
  return result;
}

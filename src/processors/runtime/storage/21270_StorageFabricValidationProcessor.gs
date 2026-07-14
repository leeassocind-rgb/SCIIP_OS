function sciipRun21270_StorageFabricValidationProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21270,processorName:'StorageFabricValidation',statusField:'storageFabricValidationStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_LEDGER',targetSheet:'STORAGE_FABRIC_VALIDATION',nextAction:'Run 21280_StorageFabricCertificationProcessor after this processor completes.'});
}
function sciipTest21270_StorageFabricValidationProcessor() {
  var result = sciipRun21270_StorageFabricValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21270_StorageFabricValidationProcessor',result:result}));
  return result;
}

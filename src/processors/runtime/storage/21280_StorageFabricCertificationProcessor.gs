function sciipRun21280_StorageFabricCertificationProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21280,processorName:'StorageFabricCertification',statusField:'storageFabricCertificationStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_VALIDATION',targetSheet:'STORAGE_FABRIC_CERTIFICATION',nextAction:'Run 21290_StorageFabricAcceptanceProcessor after this processor completes.'});
}
function sciipTest21280_StorageFabricCertificationProcessor() {
  var result = sciipRun21280_StorageFabricCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest21280_StorageFabricCertificationProcessor',result:result}));
  return result;
}

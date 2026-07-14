function sciipRun21250_StorageFabricExecutionProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21250,processorName:'StorageFabricExecution',statusField:'storageFabricExecutionStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_PLANNING',targetSheet:'STORAGE_FABRIC_EXECUTION',nextAction:'Run 21260_StorageFabricLedgerProcessor after this processor completes.'});
}
function sciipTest21250_StorageFabricExecutionProcessor() {
  var result = sciipRun21250_StorageFabricExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21250_StorageFabricExecutionProcessor',result:result}));
  return result;
}

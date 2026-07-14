function sciipRun21260_StorageFabricLedgerProcessor() {
  return SCIIP_STORAGE_FABRIC_BACKEND.executeFabricPlan({processorNumber:21260,processorName:'StorageFabricLedger',statusField:'storageFabricLedgerStatus',component:'Storage Fabric Execution',backendLayer:'Storage Fabric',sourceSheet:'STORAGE_FABRIC_EXECUTION',targetSheet:'STORAGE_FABRIC_LEDGER',nextAction:'Run 21270_StorageFabricValidationProcessor after this processor completes.'});
}
function sciipTest21260_StorageFabricLedgerProcessor() {
  var result = sciipRun21260_StorageFabricLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21260_StorageFabricLedgerProcessor',result:result}));
  return result;
}

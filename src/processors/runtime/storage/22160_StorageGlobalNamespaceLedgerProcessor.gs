function sciipRun22160_StorageGlobalNamespaceLedgerProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22160,processorName:'StorageGlobalNamespaceLedger',statusField:'storageGlobalNamespaceLedgerStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_EXECUTION',targetSheet:'STORAGE_GLOBAL_NAMESPACE_LEDGER',nextAction:'Run 22170_StorageGlobalNamespaceValidationProcessor after this processor completes.'});
}
function sciipTest22160_StorageGlobalNamespaceLedgerProcessor() {
  var result = sciipRun22160_StorageGlobalNamespaceLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest22160_StorageGlobalNamespaceLedgerProcessor',result:result}));
  return result;
}

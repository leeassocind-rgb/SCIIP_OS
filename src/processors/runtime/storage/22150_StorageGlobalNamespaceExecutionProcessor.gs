function sciipRun22150_StorageGlobalNamespaceExecutionProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22150,processorName:'StorageGlobalNamespaceExecution',statusField:'storageGlobalNamespaceExecutionStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_PLANNING',targetSheet:'STORAGE_GLOBAL_NAMESPACE_EXECUTION',nextAction:'Run 22160_StorageGlobalNamespaceLedgerProcessor after this processor completes.'});
}
function sciipTest22150_StorageGlobalNamespaceExecutionProcessor() {
  var result = sciipRun22150_StorageGlobalNamespaceExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest22150_StorageGlobalNamespaceExecutionProcessor',result:result}));
  return result;
}

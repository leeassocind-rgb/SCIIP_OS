function sciipRun22170_StorageGlobalNamespaceValidationProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22170,processorName:'StorageGlobalNamespaceValidation',statusField:'storageGlobalNamespaceValidationStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_LEDGER',targetSheet:'STORAGE_GLOBAL_NAMESPACE_VALIDATION',nextAction:'Run 22180_StorageGlobalNamespaceCertificationProcessor after this processor completes.'});
}
function sciipTest22170_StorageGlobalNamespaceValidationProcessor() {
  var result = sciipRun22170_StorageGlobalNamespaceValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest22170_StorageGlobalNamespaceValidationProcessor',result:result}));
  return result;
}

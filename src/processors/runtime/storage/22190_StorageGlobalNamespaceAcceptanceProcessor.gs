function sciipRun22190_StorageGlobalNamespaceAcceptanceProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22190,processorName:'StorageGlobalNamespaceAcceptance',statusField:'storageGlobalNamespaceAcceptanceStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_CERTIFICATION',targetSheet:'STORAGE_GLOBAL_NAMESPACE_ACCEPTANCE',nextAction:'Storage Global Namespace Execution accepted through 22190.'});
}
function sciipTest22190_StorageGlobalNamespaceAcceptanceProcessor() {
  var result = sciipRun22190_StorageGlobalNamespaceAcceptanceProcessor();
  console.log(JSON.stringify({test:'sciipTest22190_StorageGlobalNamespaceAcceptanceProcessor',result:result}));
  return result;
}

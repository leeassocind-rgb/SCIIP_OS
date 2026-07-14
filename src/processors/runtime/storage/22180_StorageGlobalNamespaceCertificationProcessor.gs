function sciipRun22180_StorageGlobalNamespaceCertificationProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22180,processorName:'StorageGlobalNamespaceCertification',statusField:'storageGlobalNamespaceCertificationStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_VALIDATION',targetSheet:'STORAGE_GLOBAL_NAMESPACE_CERTIFICATION',nextAction:'Run 22190_StorageGlobalNamespaceAcceptanceProcessor after this processor completes.'});
}
function sciipTest22180_StorageGlobalNamespaceCertificationProcessor() {
  var result = sciipRun22180_StorageGlobalNamespaceCertificationProcessor();
  console.log(JSON.stringify({test:'sciipTest22180_StorageGlobalNamespaceCertificationProcessor',result:result}));
  return result;
}

function sciipRun22140_StorageGlobalNamespacePlanningProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22140,processorName:'StorageGlobalNamespacePlanning',statusField:'storageGlobalNamespacePlanningStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_RISK_ANALYSIS',targetSheet:'STORAGE_GLOBAL_NAMESPACE_PLANNING',nextAction:'Run 22150_StorageGlobalNamespaceExecutionProcessor after this processor completes.'});
}
function sciipTest22140_StorageGlobalNamespacePlanningProcessor() {
  var result = sciipRun22140_StorageGlobalNamespacePlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest22140_StorageGlobalNamespacePlanningProcessor',result:result}));
  return result;
}

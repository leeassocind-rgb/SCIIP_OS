function sciipRun22130_StorageGlobalNamespaceRiskAnalysisProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22130,processorName:'StorageGlobalNamespaceRiskAnalysis',statusField:'storageGlobalNamespaceRiskAnalysisStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_GLOBAL_NAMESPACE_RISK_ANALYSIS',nextAction:'Run 22140_StorageGlobalNamespacePlanningProcessor after this processor completes.'});
}
function sciipTest22130_StorageGlobalNamespaceRiskAnalysisProcessor() {
  var result = sciipRun22130_StorageGlobalNamespaceRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest22130_StorageGlobalNamespaceRiskAnalysisProcessor',result:result}));
  return result;
}

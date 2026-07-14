function sciipRun22120_StorageGlobalNamespaceCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_GLOBAL_NAMESPACE_BACKEND.executeGlobalNamespacePlan({processorNumber:22120,processorName:'StorageGlobalNamespaceCoverageAssessment',statusField:'storageGlobalNamespaceCoverageAssessmentStatus',component:'Storage Global Namespace Execution',backendLayer:'Storage Global Namespace',sourceSheet:'STORAGE_GLOBAL_NAMESPACE_POLICY_REGISTRY',targetSheet:'STORAGE_GLOBAL_NAMESPACE_COVERAGE_ASSESSMENT',nextAction:'Run 22130_StorageGlobalNamespaceRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest22120_StorageGlobalNamespaceCoverageAssessmentProcessor() {
  var result = sciipRun22120_StorageGlobalNamespaceCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest22120_StorageGlobalNamespaceCoverageAssessmentProcessor',result:result}));
  return result;
}

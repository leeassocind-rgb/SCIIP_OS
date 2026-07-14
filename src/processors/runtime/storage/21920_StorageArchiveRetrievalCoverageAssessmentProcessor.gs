function sciipRun21920_StorageArchiveRetrievalCoverageAssessmentProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21920,processorName:'StorageArchiveRetrievalCoverageAssessment',statusField:'storageArchiveRetrievalCoverageAssessmentStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_POLICY_REGISTRY',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_COVERAGE_ASSESSMENT',nextAction:'Run 21930_StorageArchiveRetrievalRiskAnalysisProcessor after this processor completes.'});
}
function sciipTest21920_StorageArchiveRetrievalCoverageAssessmentProcessor() {
  var result = sciipRun21920_StorageArchiveRetrievalCoverageAssessmentProcessor();
  console.log(JSON.stringify({test:'sciipTest21920_StorageArchiveRetrievalCoverageAssessmentProcessor',result:result}));
  return result;
}

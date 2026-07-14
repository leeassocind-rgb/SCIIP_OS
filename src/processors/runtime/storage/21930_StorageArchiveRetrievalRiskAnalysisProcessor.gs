function sciipRun21930_StorageArchiveRetrievalRiskAnalysisProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21930,processorName:'StorageArchiveRetrievalRiskAnalysis',statusField:'storageArchiveRetrievalRiskAnalysisStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_COVERAGE_ASSESSMENT',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_RISK_ANALYSIS',nextAction:'Run 21940_StorageArchiveRetrievalPlanningProcessor after this processor completes.'});
}
function sciipTest21930_StorageArchiveRetrievalRiskAnalysisProcessor() {
  var result = sciipRun21930_StorageArchiveRetrievalRiskAnalysisProcessor();
  console.log(JSON.stringify({test:'sciipTest21930_StorageArchiveRetrievalRiskAnalysisProcessor',result:result}));
  return result;
}

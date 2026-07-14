function sciipRun21940_StorageArchiveRetrievalPlanningProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21940,processorName:'StorageArchiveRetrievalPlanning',statusField:'storageArchiveRetrievalPlanningStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_RISK_ANALYSIS',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_PLANNING',nextAction:'Run 21950_StorageArchiveRetrievalExecutionProcessor after this processor completes.'});
}
function sciipTest21940_StorageArchiveRetrievalPlanningProcessor() {
  var result = sciipRun21940_StorageArchiveRetrievalPlanningProcessor();
  console.log(JSON.stringify({test:'sciipTest21940_StorageArchiveRetrievalPlanningProcessor',result:result}));
  return result;
}

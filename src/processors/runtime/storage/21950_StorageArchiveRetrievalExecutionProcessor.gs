function sciipRun21950_StorageArchiveRetrievalExecutionProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21950,processorName:'StorageArchiveRetrievalExecution',statusField:'storageArchiveRetrievalExecutionStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_PLANNING',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_EXECUTION',nextAction:'Run 21960_StorageArchiveRetrievalLedgerProcessor after this processor completes.'});
}
function sciipTest21950_StorageArchiveRetrievalExecutionProcessor() {
  var result = sciipRun21950_StorageArchiveRetrievalExecutionProcessor();
  console.log(JSON.stringify({test:'sciipTest21950_StorageArchiveRetrievalExecutionProcessor',result:result}));
  return result;
}

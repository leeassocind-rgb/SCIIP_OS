function sciipRun21970_StorageArchiveRetrievalValidationProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21970,processorName:'StorageArchiveRetrievalValidation',statusField:'storageArchiveRetrievalValidationStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_LEDGER',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_VALIDATION',nextAction:'Run 21980_StorageArchiveRetrievalCertificationProcessor after this processor completes.'});
}
function sciipTest21970_StorageArchiveRetrievalValidationProcessor() {
  var result = sciipRun21970_StorageArchiveRetrievalValidationProcessor();
  console.log(JSON.stringify({test:'sciipTest21970_StorageArchiveRetrievalValidationProcessor',result:result}));
  return result;
}

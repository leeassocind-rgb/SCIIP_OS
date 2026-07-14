function sciipRun21960_StorageArchiveRetrievalLedgerProcessor() {
  return SCIIP_STORAGE_ARCHIVE_RETRIEVAL_BACKEND.executeArchiveRetrievalPlan({processorNumber:21960,processorName:'StorageArchiveRetrievalLedger',statusField:'storageArchiveRetrievalLedgerStatus',component:'Storage Archive Retrieval Execution',backendLayer:'Storage Archive Retrieval',sourceSheet:'STORAGE_ARCHIVE_RETRIEVAL_EXECUTION',targetSheet:'STORAGE_ARCHIVE_RETRIEVAL_LEDGER',nextAction:'Run 21970_StorageArchiveRetrievalValidationProcessor after this processor completes.'});
}
function sciipTest21960_StorageArchiveRetrievalLedgerProcessor() {
  var result = sciipRun21960_StorageArchiveRetrievalLedgerProcessor();
  console.log(JSON.stringify({test:'sciipTest21960_StorageArchiveRetrievalLedgerProcessor',result:result}));
  return result;
}

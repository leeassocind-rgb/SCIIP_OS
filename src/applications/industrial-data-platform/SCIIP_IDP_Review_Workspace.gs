/** Product-facing contract for the Imports review workspace. */
function sciipIndustrialDataImportReviewWorkspace(){
  return {version:SCIIP_IDP_RELEASE2_V7.VERSION,status:'AVAILABLE',workspace:'data-sources/import-review',sections:['JOB_SUMMARY','SOURCE_CONFIDENCE','NEW_RECORDS','UPDATE_CANDIDATES','DUPLICATES','VALIDATION_ISSUES','ENTITY_MATCHES','FIELD_CHANGES','REVIEW_DECISIONS','COMMIT_PREPARATION','IMPORT_HISTORY'],actions:['APPROVE','REJECT','HOLD','RESOLVE_ENTITY','PREPARE_COMMIT_PLAN'],destructiveCommitEnabled:false,releaseState:'REVIEW_AND_COMMIT_PREPARATION_READY'};
}

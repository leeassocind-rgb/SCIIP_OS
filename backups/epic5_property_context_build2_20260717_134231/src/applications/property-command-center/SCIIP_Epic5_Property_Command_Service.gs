/** Apps Script adapters for the Epic 5 Property Command Center. */
var SCIIP_PROPERTY_COMMAND_SERVICE_V7 = SCIIP_PROPERTY_COMMAND_SERVICE_V7 || {};
SCIIP_PROPERTY_COMMAND_SERVICE_V7.workspace = function(selectedPropertyId){
  if(typeof SCIIP_IDP_LEDGER_QUERY_V7==='undefined')throw new Error('Industrial Data Platform ledger query service is required.');
  var jobs=SCIIP_IDP_LEDGER_QUERY_V7.jobs();
  var current=SCIIP_IDP_LEDGER_QUERY_V7.current().map(function(r){var payload=SCIIP_PROPERTY_COMMAND_V7.safeJson(r.recordJson||r.payloadJson,r);if(payload&&typeof payload==='object'){if(!payload.businessKey)payload.businessKey=r.businessKey;return payload;}return r;});
  var history=SCIIP_IDP_LEDGER_QUERY_V7.history('');
  var exceptions=[];jobs.slice(0,25).forEach(function(j){SCIIP_IDP_LEDGER_QUERY_V7.records(j.jobId).forEach(function(r){if(String(r.reviewStatus||'').toUpperCase()!=='APPROVED')exceptions.push(r);});});
  return SCIIP_PROPERTY_COMMAND_V7.project({selectedPropertyId:selectedPropertyId,current:current,jobs:jobs,history:history,exceptions:exceptions});
};
SCIIP_PROPERTY_COMMAND_SERVICE_V7.ingestActiveSheet = function(){
  if(typeof sciipCreateIndustrialDataImportJobFromActiveSheet!=='function')throw new Error('Industrial Data Platform import job service is required.');
  var result=sciipCreateIndustrialDataImportJobFromActiveSheet();
  return {status:result.job.status,jobId:result.job.jobId,rowCount:result.job.rowCount,commitAllowed:result.job.commitAllowed===true,nextAction:'OPEN_DATA_SOURCES_REVIEW',destructiveCommitEnabled:false,reviewRequired:true};
};
function sciipGetPropertyCommandCenter(selectedPropertyId){return SCIIP_PROPERTY_COMMAND_SERVICE_V7.workspace(selectedPropertyId);}
function sciipPropertyCommandIngestActiveSheet(){return SCIIP_PROPERTY_COMMAND_SERVICE_V7.ingestActiveSheet();}

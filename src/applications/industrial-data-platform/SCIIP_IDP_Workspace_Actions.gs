/** Controlled actions used by the Data Sources workspace. */
var SCIIP_IDP_WORKSPACE_ACTIONS_V7 = SCIIP_IDP_WORKSPACE_ACTIONS_V7 || {};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.createFromActiveSheet=function(){return sciipCreateIndustrialDataImportJobFromActiveSheet();};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.decide=function(jobId,recordId,decision,reason){return SCIIP_IDP_JOB_SERVICE_V7.recordDecision(jobId,recordId,decision,reason||'',SCIIP_IDP_RELEASE4_V7.actor());};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.persistedReview=function(jobId){
  var records=SCIIP_IDP_LEDGER_QUERY_V7.records(jobId),latest=SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.decisions(jobId),'recordId');
  return records.map(function(r){var d=latest[String(r.recordId)],status=d?(d.decision==='APPROVE'?'APPROVED':(d.decision==='REJECT'?'REJECTED':'HELD')):r.reviewStatus;return {recordId:r.recordId,rowNumber:r.rowNumber,businessKey:r.businessKey,classification:r.classification,reviewStatus:status,record:SCIIP_IDP_RELEASE4_V7.safeJson(r.recordJson,{}),validation:SCIIP_IDP_RELEASE4_V7.safeJson(r.validationJson,{}),changes:SCIIP_IDP_RELEASE4_V7.safeJson(r.changesJson,[]),current:null,entityMatches:[]};});
};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.prepare=function(jobId){return SCIIP_IDP_COMMIT_PREP_V7.persistPlan(jobId,SCIIP_IDP_WORKSPACE_ACTIONS_V7.persistedReview(jobId),SCIIP_IDP_RELEASE4_V7.actor());};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.execute=function(planId){return SCIIP_IDP_COMMIT_EXECUTION_V7.executePlanById(planId,SCIIP_IDP_RELEASE4_V7.actor());};
function sciipDataSourcesCreateFromActiveSheet(){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.createFromActiveSheet();}
function sciipDataSourcesRecordDecision(jobId,recordId,decision,reason){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.decide(jobId,recordId,decision,reason);}
function sciipDataSourcesPrepareCommit(jobId){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.prepare(jobId);}
function sciipDataSourcesExecuteCommit(planId){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.execute(planId);}

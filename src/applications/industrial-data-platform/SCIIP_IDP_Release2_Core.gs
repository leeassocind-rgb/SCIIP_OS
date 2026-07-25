/** SCIIP_OS v7 — Epic 1 Release 2: Persistent Import Review. */
var SCIIP_IDP_RELEASE2_V7 = SCIIP_IDP_RELEASE2_V7 || {};
SCIIP_IDP_RELEASE2_V7.VERSION = 'v7.0-epic1-release2.0';
SCIIP_IDP_RELEASE2_V7.SHEETS = {
  JOBS:'SCIIP_IDP_IMPORT_JOBS',
  RECORDS:'SCIIP_IDP_IMPORT_RECORDS',
  DECISIONS:'SCIIP_IDP_REVIEW_DECISIONS',
  ENTITY_MATCHES:'SCIIP_IDP_ENTITY_MATCHES',
  COMMIT_PLANS:'SCIIP_IDP_COMMIT_PLANS',
  HISTORY:'SCIIP_IDP_IMPORT_HISTORY'
};
SCIIP_IDP_RELEASE2_V7.HEADERS = {
  JOBS:['jobId','createdAt','createdBy','sourceType','sourceName','confidence','status','rowCount','newCount','updateCount','duplicateCount','errorCount','warningCount','commitAllowed','payloadJson'],
  RECORDS:['recordId','jobId','rowNumber','businessKey','classification','reviewStatus','changeCount','entityMatchCount','recordJson','validationJson','changesJson'],
  DECISIONS:['decisionId','jobId','recordId','decision','reason','decidedBy','decidedAt','payloadJson'],
  ENTITY_MATCHES:['matchId','jobId','recordId','entityType','incomingValue','candidateId','candidateLabel','confidence','resolutionStatus','createdAt','payloadJson'],
  COMMIT_PLANS:['planId','jobId','createdAt','createdBy','status','approvedCount','rejectedCount','blockedCount','operationCount','rollbackToken','operationsJson'],
  HISTORY:['eventId','jobId','eventType','status','actor','occurredAt','detailsJson']
};
SCIIP_IDP_RELEASE2_V7.now = function(){return new Date().toISOString();};
SCIIP_IDP_RELEASE2_V7.id = function(prefix){return prefix+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);};
SCIIP_IDP_RELEASE2_V7.json = function(value){return JSON.stringify(value == null ? null : value);};

/** SCIIP_OS v7 — Epic 1 Release 3: Trusted Knowledge Commit. */
var SCIIP_IDP_RELEASE3_V7 = SCIIP_IDP_RELEASE3_V7 || {};
SCIIP_IDP_RELEASE3_V7.VERSION = 'v7.0-epic1-release3.0';
SCIIP_IDP_RELEASE3_V7.SHEETS = {
  EXECUTIONS:'SCIIP_IDP_COMMIT_EXECUTIONS', EVENTS:'SCIIP_IDP_DOMAIN_EVENTS',
  CANONICAL:'SCIIP_IDP_CANONICAL_PROPERTY_LEDGER', CURRENT:'SCIIP_IDP_PROPERTY_CURRENT_PROJECTION',
  GRAPH:'SCIIP_IDP_KNOWLEDGE_GRAPH_EDGES', GIS:'SCIIP_IDP_GIS_FEATURE_LEDGER',
  SEARCH:'SCIIP_IDP_SEARCH_INDEX_LEDGER', NOTIFICATIONS:'SCIIP_IDP_NOTIFICATION_LEDGER',
  ROLLBACKS:'SCIIP_IDP_ROLLBACK_EXECUTIONS'
};
SCIIP_IDP_RELEASE3_V7.HEADERS = {
  EXECUTIONS:['executionId','executionKey','planId','jobId','status','startedAt','completedAt','actor','operationCount','eventCount','rollbackToken','summaryJson'],
  EVENTS:['eventId','executionId','planId','jobId','aggregateType','aggregateId','eventType','occurredAt','actor','beforeJson','afterJson','changesJson','sourceJson'],
  CANONICAL:['snapshotId','executionId','businessKey','propertyId','lifecycleState','effectiveAt','recordJson','sourceEventId'],
  CURRENT:['projectionId','executionId','businessKey','propertyId','lifecycleState','effectiveAt','recordJson','sourceEventId'],
  GRAPH:['edgeId','executionId','fromId','relationship','toId','effectiveAt','payloadJson','sourceEventId'],
  GIS:['featureId','executionId','businessKey','latitude','longitude','effectiveAt','payloadJson','sourceEventId'],
  SEARCH:['documentId','executionId','businessKey','effectiveAt','searchText','payloadJson','sourceEventId'],
  NOTIFICATIONS:['notificationId','executionId','type','severity','createdAt','title','message','payloadJson'],
  ROLLBACKS:['rollbackExecutionId','originalExecutionId','rollbackToken','status','startedAt','completedAt','actor','compensationCount','summaryJson']
};
SCIIP_IDP_RELEASE3_V7.now = function(){return new Date().toISOString();};
SCIIP_IDP_RELEASE3_V7.id = function(prefix){return prefix+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);};
SCIIP_IDP_RELEASE3_V7.json = function(v){return JSON.stringify(v == null ? null : v);};
SCIIP_IDP_RELEASE3_V7.slug = function(v){return String(v==null?'':v).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');};
SCIIP_IDP_RELEASE3_V7.propertyId = function(businessKey){var h=0,s=String(businessKey||'');for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return 'PROP-'+Math.abs(h);};

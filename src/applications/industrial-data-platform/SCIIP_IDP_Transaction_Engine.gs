/** Pure transaction compiler: approved plans -> immutable events and projections. */
var SCIIP_IDP_TRANSACTION_V7 = SCIIP_IDP_TRANSACTION_V7 || {};
SCIIP_IDP_TRANSACTION_V7.validatePlan = function(plan){
  var errors=[]; plan=plan||{};
  if(!plan.planId)errors.push('planId is required.');
  if(!plan.jobId)errors.push('jobId is required.');
  if(plan.commitExecutable!==true)errors.push('Plan is not executable.');
  if(!Array.isArray(plan.operations)||!plan.operations.length)errors.push('At least one operation is required.');
  (plan.operations||[]).forEach(function(op,i){if(!op.businessKey)errors.push('Operation '+i+' is missing businessKey.');if(!op.after)errors.push('Operation '+i+' is missing after state.');});
  return {valid:errors.length===0,errors:errors};
};
SCIIP_IDP_TRANSACTION_V7.executionKey = function(plan){return String(plan.planId)+'|'+String(plan.rollbackToken||'NO_ROLLBACK')+'|'+String((plan.operations||[]).length);};
SCIIP_IDP_TRANSACTION_V7.compile = function(plan,actor,clock){
  var validation=SCIIP_IDP_TRANSACTION_V7.validatePlan(plan); if(!validation.valid)throw new Error(validation.errors.join(' | '));
  actor=actor||'UNKNOWN'; var now=clock||SCIIP_IDP_RELEASE3_V7.now(); var executionId=SCIIP_IDP_RELEASE3_V7.id('EXEC');
  var out={executionId:executionId,executionKey:SCIIP_IDP_TRANSACTION_V7.executionKey(plan),planId:plan.planId,jobId:plan.jobId,actor:actor,startedAt:now,rollbackToken:plan.rollbackToken,events:[],canonical:[],current:[],graph:[],gis:[],search:[],notifications:[]};
  plan.operations.forEach(function(op,index){
    var propertyId=SCIIP_IDP_RELEASE3_V7.propertyId(op.businessKey), eventId=SCIIP_IDP_RELEASE3_V7.id('DOMAIN-EVT');
    var eventType=op.operationType==='UPDATE_PROPERTY'?'PROPERTY_UPDATED':'PROPERTY_CREATED';
    var source={planId:plan.planId,jobId:plan.jobId,recordId:op.recordId,operationId:op.operationId};
    var event={eventId:eventId,executionId:executionId,planId:plan.planId,jobId:plan.jobId,aggregateType:'PROPERTY',aggregateId:propertyId,eventType:eventType,occurredAt:now,actor:actor,before:op.before||null,after:op.after,changes:op.changes||[],source:source};
    out.events.push(event);
    var snapshot={snapshotId:SCIIP_IDP_RELEASE3_V7.id('SNAP'),executionId:executionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:'CURRENT',effectiveAt:now,record:op.after,sourceEventId:eventId};
    out.canonical.push(snapshot); out.current.push({projectionId:SCIIP_IDP_RELEASE3_V7.id('CURRENT'),executionId:executionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:'CURRENT',effectiveAt:now,record:op.after,sourceEventId:eventId});
    [['owner','OWNED_BY'],['tenant','OCCUPIED_BY']].forEach(function(spec){var value=op.after[spec[0]];if(value)out.graph.push({edgeId:SCIIP_IDP_RELEASE3_V7.id('EDGE'),executionId:executionId,fromId:propertyId,relationship:spec[1],toId:spec[0].toUpperCase()+'-'+SCIIP_IDP_RELEASE3_V7.slug(value),effectiveAt:now,payload:{label:value},sourceEventId:eventId});});
    var lat=Number(op.after.latitude), lng=Number(op.after.longitude); if(isFinite(lat)&&isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180)out.gis.push({featureId:SCIIP_IDP_RELEASE3_V7.id('GIS'),executionId:executionId,businessKey:op.businessKey,latitude:lat,longitude:lng,effectiveAt:now,payload:{propertyId:propertyId,address:op.after.address||'',city:op.after.city||'',state:op.after.state||''},sourceEventId:eventId});
    var searchText=[op.after.address,op.after.city,op.after.state,op.after.apn,op.after.owner,op.after.tenant,op.after.buildingSf].filter(function(x){return x!=null&&x!=='';}).join(' ').toLowerCase();
    out.search.push({documentId:SCIIP_IDP_RELEASE3_V7.id('SEARCH'),executionId:executionId,businessKey:op.businessKey,effectiveAt:now,searchText:searchText,payload:{propertyId:propertyId,record:op.after},sourceEventId:eventId});
    out.notifications.push({notificationId:SCIIP_IDP_RELEASE3_V7.id('NOTE'),executionId:executionId,type:eventType,severity:'INFO',createdAt:now,title:eventType==='PROPERTY_CREATED'?'Property added':'Property updated',message:(op.after.address||op.businessKey)+' was committed from approved import '+plan.jobId+'.',payload:{propertyId:propertyId,businessKey:op.businessKey,eventId:eventId}});
  });
  out.summary={operations:plan.operations.length,events:out.events.length,canonicalSnapshots:out.canonical.length,currentProjections:out.current.length,graphEdges:out.graph.length,gisFeatures:out.gis.length,searchDocuments:out.search.length,notifications:out.notifications.length};
  return out;
};

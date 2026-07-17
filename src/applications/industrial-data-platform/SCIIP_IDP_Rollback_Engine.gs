/** Pure compensating-event rollback compiler. */
var SCIIP_IDP_ROLLBACK_V7 = SCIIP_IDP_ROLLBACK_V7 || {};
SCIIP_IDP_ROLLBACK_V7.compile = function(plan,execution,actor,clock){
  if(!plan||!execution)throw new Error('Plan and execution are required.');
  if(plan.rollbackToken!==execution.rollbackToken)throw new Error('Rollback token mismatch.');
  var now=clock||SCIIP_IDP_RELEASE3_V7.now(), rollbackExecutionId=SCIIP_IDP_RELEASE3_V7.id('ROLLBACK-EXEC'), events=[],current=[];
  (plan.operations||[]).forEach(function(op){
    var propertyId=SCIIP_IDP_RELEASE3_V7.propertyId(op.businessKey), isCreate=op.operationType!=='UPDATE_PROPERTY', eventId=SCIIP_IDP_RELEASE3_V7.id('COMP-EVT');
    var restored=isCreate?Object.assign({},op.after,{lifecycleState:'ARCHIVED'}):(op.before||{});
    events.push({eventId:eventId,executionId:rollbackExecutionId,planId:plan.planId,jobId:plan.jobId,aggregateType:'PROPERTY',aggregateId:propertyId,eventType:isCreate?'PROPERTY_CREATION_REVERSED':'PROPERTY_UPDATE_REVERSED',occurredAt:now,actor:actor||'UNKNOWN',before:op.after,after:restored,changes:op.changes||[],source:{originalExecutionId:execution.executionId,rollbackToken:plan.rollbackToken}});
    current.push({projectionId:SCIIP_IDP_RELEASE3_V7.id('CURRENT'),executionId:rollbackExecutionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:isCreate?'ARCHIVED':'CURRENT',effectiveAt:now,record:restored,sourceEventId:eventId});
  });
  return {rollbackExecutionId:rollbackExecutionId,originalExecutionId:execution.executionId,rollbackToken:plan.rollbackToken,status:'COMPILED',startedAt:now,actor:actor||'UNKNOWN',events:events,current:current,compensationCount:events.length};
};

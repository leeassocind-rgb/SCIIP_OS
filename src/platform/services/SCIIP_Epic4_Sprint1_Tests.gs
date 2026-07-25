/** SCIIP_OS v7 Epic 4 Sprint 1 certification. */
function sciipTestV7Epic4Sprint1(){
  var failures=[],tests=0;function ok(name,c){tests++;if(!c)failures.push(name);}
  SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.clearForTest();SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.clearForTest();SCIIP_UNIFIED_PLATFORM_AUDIT_PERSISTENCE.clearForTest();
  var r1=SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.register({serviceId:'GIS_SERVICE',domain:'SPATIAL',capabilities:['MAP_PROJECTION'],version:'1.0.0'});
  var r2=SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.register({serviceId:'GIS_SERVICE',domain:'SPATIAL',capabilities:['MAP_PROJECTION'],version:'1.0.0'});
  ok('service registry duplicate safety',r1.status==='REGISTERED'&&r2.status==='DUPLICATE_SAFE'&&SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.list().length===1);
  ok('capability discovery',SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.discover('MAP_PROJECTION').length===1&&SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.resolve('GIS_SERVICE','MAP_PROJECTION')!==null);
  var source={workspace:'PROPERTY_EXPLORER',selectedEntityId:'P-1',entityIds:['P-1'],evidenceIds:['E-1'],actorId:'USER-1'};
  var propagated=SCIIP_UNIFIED_PLATFORM_CONTEXT_EVIDENCE_SERVICE.propagate(source,'GIS_WORKSPACE',{geometryIds:['G-1'],evidenceIds:['E-2']});
  ok('cross-workspace context',propagated.workspace==='GIS_WORKSPACE'&&propagated.selectedEntityId==='P-1'&&propagated.evidenceIds.length===2&&propagated.geometryIds[0]==='G-1');
  var evidence=SCIIP_UNIFIED_PLATFORM_CONTEXT_EVIDENCE_SERVICE.validateEvidence([{evidenceId:'E-1',sourceType:'SUPERSHEET',sourceId:'ROW-1',confidence:92,immutable:true}],{minimumConfidence:60});
  ok('evidence governance',evidence.status==='VALID'&&evidence.reviewRequired===true);
  SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.registerHandler('QUERY','GET_PROPERTY',function(p){return {propertyId:p.propertyId,status:'FOUND'};});
  SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.registerHandler('COMMAND','APPROVE_ACTION',function(p,c){return {actionId:p.actionId,approvedBy:c.actorId};},{requiresApproval:true});
  var q=SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.dispatch('QUERY','GET_PROPERTY',{propertyId:'P-1'},{messageId:'Q-1',workspace:'PROPERTY_EXPLORER'});
  var pending=SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.dispatch('COMMAND','APPROVE_ACTION',{actionId:'A-1'},{messageId:'C-1',workspace:'EXECUTIVE',actorId:'EXEC-1'});
  var approved=SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.dispatch('COMMAND','APPROVE_ACTION',{actionId:'A-1'},{messageId:'C-1',workspace:'EXECUTIVE',actorId:'EXEC-1',approvedBy:'EXEC-1'});
  var duplicate=SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.dispatch('COMMAND','APPROVE_ACTION',{actionId:'A-1'},{messageId:'C-1',workspace:'EXECUTIVE',actorId:'EXEC-1',approvedBy:'EXEC-1'});
  ok('command query bus',q.status==='COMPLETED'&&pending.status==='PENDING_APPROVAL'&&approved.status==='COMPLETED'&&duplicate.status==='DUPLICATE_SAFE');
  var persisted=SCIIP_UNIFIED_PLATFORM_AUDIT_PERSISTENCE.append(SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.audit().concat(SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.audit()));
  ok('append-only audit persistence',persisted.appended===2&&persisted.duplicates===2&&persisted.total===2);
  var app=SCIIP_EPIC4_SPRINT1_UNIFIED_PLATFORM_APPLICATION.bootstrap();
  ok('platform bootstrap',app.services.length===6&&app.health.status==='CERTIFIED'&&app.health.releaseGate==='APPROVED_FOR_CONTROLLED_RELEASE');
  ok('North Star controls',app.descriptor.reviewRequired===true&&app.descriptor.destructiveCommitEnabled===false&&app.descriptor.autonomousExecution===false&&app.descriptor.automaticDeployment===false);
  return {framework:'SCIIP_V7_EPIC_4_SPRINT_1_UNIFIED_PLATFORM_SERVICES_FOUNDATION',version:'v7.0-epic4-sprint1.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{servicesRegistered:app.services.length,registryEvents:SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY.audit().length,commandAuditEvents:SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS.audit().length,persistedAuditEvents:persisted.total,platformStatus:app.health.status,releaseGate:app.health.releaseGate,workspace:app.descriptor.workspace,northStarAligned:app.health.northStarAligned,reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,automaticDeployment:false}};
}

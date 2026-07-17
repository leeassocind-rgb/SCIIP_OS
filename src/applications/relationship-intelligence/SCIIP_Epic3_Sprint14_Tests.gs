/** SCIIP_OS v7 Epic 3 Sprint 14 end-to-end production certification. */
function sciipTestV7Epic3Sprint14(){
  var failures=[],tests=0;function ok(name,condition){tests++;if(!condition)failures.push(name);}
  var ids=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.REQUIRED_STAGES;
  var stages=ids.map(function(id,i){return {stageId:id,status:i===8?'READY':'PASSED',businessKey:'BK|'+id+'|2026-07-17',outputId:'OUT-'+(i+1),evidenceIds:['E-'+(i+1)],entityIds:id==='ENTERPRISE_RELATIONSHIP_GRAPH'?['PROPERTY-1','COMPANY-1']:[],gisContext:id==='EXECUTIVE_COMMAND'?{points:2,links:1}:null,appendOnly:true,duplicateSafe:true,reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,sourceStageIds:i?[ids[i-1]]:[]};});
  var certification=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify({stages:stages});
  ok('all Epic 3 stages certified',certification.status==='PRODUCTION_READY'&&certification.stagesCertified===9&&certification.failures.length===0);
  ok('end-to-end lineage preserved',certification.lineage.length===9&&certification.lineage[8].sources[0]==='ADAPTIVE_LEARNING');
  ok('GIS integration required',stages[4].gisContext.points===2&&certification.northStar.powersGIS===true);
  ok('human control enforced',certification.controls.reviewRequired===true&&certification.controls.autonomousExecution===false&&certification.controls.destructiveCommitEnabled===false);
  var gate=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(certification);
  ok('controlled release gate',gate.status==='APPROVED_FOR_CONTROLLED_RELEASE'&&gate.requiresHumanReleaseApproval===true&&gate.automaticDeployment===false);
  SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE.clearForTest();var persisted=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE.append([certification,certification]);
  ok('append-only duplicate safety',persisted.appended===1&&persisted.total===1&&persisted.duplicateSafe===true);
  var broken=JSON.parse(JSON.stringify(stages));broken[5].sourceStageIds=['WRONG_STAGE'];var failed=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify({stages:broken});
  ok('broken contracts block release',failed.status==='FAILED'&&failed.failures.some(function(f){return f.code==='BROKEN_STAGE_CHAIN';})&&SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(failed).status==='BLOCKED');
  var app=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_APPLICATION.run({stages:stages});
  ok('North Star release certification',app.releaseSummary.northStarAligned===true&&app.descriptor.northStar.length===8&&app.descriptor.workspace==='enterprise-intelligence-command-platform');
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_14_PRODUCTION_HARDENING_INTEGRATION_CERTIFICATION',version:'v7.0-epic3-sprint14.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{epic3Status:certification.status,stagesCertified:certification.stagesCertified,lineageRecords:certification.lineage.length,persistedCertifications:persisted.total,releaseGate:gate.status,workspace:app.descriptor.workspace,northStarAligned:app.releaseSummary.northStarAligned,reviewRequired:true,rollbackRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,automaticDeployment:false}};
}

/** SCIIP_OS v7.0 Sprint 3F — resilience and release assurance workspace. */
var SCIIP_RESILIENCE_ASSURANCE_WORKSPACE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3f';
  function snapshot(){var audit=typeof SCIIP_AUDIT_TRAIL!=='undefined'?SCIIP_AUDIT_TRAIL.snapshot():{count:0},controls=typeof SCIIP_CONTROL_ASSURANCE_ENGINE!=='undefined'?SCIIP_CONTROL_ASSURANCE_ENGINE.summary():{registered:0,failed:0,status:'UNAVAILABLE'},resilience=typeof SCIIP_OPERATIONAL_RESILIENCE_ENGINE!=='undefined'?SCIIP_OPERATIONAL_RESILIENCE_ENGINE.snapshot():{plans:0,open:0,status:'UNAVAILABLE'},release=typeof SCIIP_RELEASE_ASSURANCE_ENGINE!=='undefined'?SCIIP_RELEASE_ASSURANCE_ENGINE.latest():null;return {version:VERSION,status:(controls.failed||resilience.open||(release&&release.status==='BLOCKED'))?'ATTENTION_REQUIRED':'OPERATIONAL',kpis:[{id:'audit',label:'Audit Evidence',value:audit.count},{id:'controls',label:'Registered Controls',value:controls.registered},{id:'failures',label:'Failed Controls',value:controls.failed},{id:'incidents',label:'Open Incidents',value:resilience.open},{id:'release',label:'Release Assurance',value:release?release.status:'NOT_RUN'}],audit:audit,controls:controls,resilience:resilience,release:release,generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,snapshot:snapshot};
})();
function sciipResilienceAssuranceWorkspaceSnapshotV7(){return SCIIP_RESILIENCE_ASSURANCE_WORKSPACE.snapshot();}

/** Sprint 14 application descriptor and orchestration. */
var SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_APPLICATION=(function(){
  'use strict';
  function descriptor(){return {id:'epic3-production-hardening-integration-certification',version:SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.VERSION,workspace:'enterprise-intelligence-command-platform',northStar:['ingest','preserve-history','connect-knowledge','GIS','analyze','manage','act','one-trusted-platform'],dependencies:['epic3-sprints-5-through-13'],reviewRequired:true,automaticDeployment:false,destructiveCommitEnabled:false};}
  function run(input){var certification=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify(input||{});return {descriptor:descriptor(),certification:certification,deploymentGate:SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(certification),releaseSummary:{status:certification.status,stagesCertified:certification.stagesCertified,failures:certification.failures.length,warnings:certification.warnings.length,northStarAligned:Object.keys(certification.northStar).every(function(k){return certification.northStar[k]===true;}),reviewRequired:true}};}
  return {descriptor:descriptor,run:run};
}());

/** SCIIP_OS v7.0 Sprint 4B — automatic integration certification. */
var SCIIP_PLATFORM_CERTIFIER=(function(){
'use strict';var VERSION='v7.0-integration-sprint-4b', history=[];
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function contains(list,value){return list.indexOf(value)>=0;}
function certifyCapability(def){var checks=[],missing=[];function check(name,ok,detail){checks.push({name:name,status:ok?'PASSED':'FAILED',detail:detail||''});if(!ok)missing.push(name);}
 var q=SCIIP_PLATFORM_ADAPTERS.queryNames(),l=SCIIP_PLATFORM_ADAPTERS.liveNames(),w=SCIIP_PLATFORM_ADAPTERS.workspaceNames();
 def.queries.forEach(function(x){check('QUERY:'+x,contains(q,x),'Query Engine registration');});
 def.services.forEach(function(x){check('LIVE:'+x,contains(l,x),'Live Runtime registration');});
 if(def.events.length)check('EVENT_BUS',SCIIP_PLATFORM_ADAPTERS.hasEventBus(),'Event subscription contract');
 if(def.stateBindings.length)check('APP_STATE',SCIIP_PLATFORM_ADAPTERS.hasState(),'Shared state contract');
 def.workspaces.forEach(function(x){check('WORKSPACE:'+x,contains(w,x)||typeof SCIIP_DESKTOP==='undefined','Workspace registration');});
 check('TESTS',def.tests.length>0,'Explicit test metadata');
 check('COMPILER_V2',def.metadata.compilerV2!==false,'Compiler v2 compatibility');
 check('NO_PROCESSORS',def.metadata.noProcessors!==false,'No processor creation');
 return {capabilityId:def.id,status:missing.length?'FAILED':'PASSED',checks:checks,missing:missing};}
function certify(request){request=request||{};if(request.assemble!==false)SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'CERTIFIER'});var registry=SCIIP_PLATFORM_REGISTRY.snapshot(),results=[],failures=[];
 registry.definitions.forEach(function(def){if(!def.enabled)return;var r=certifyCapability(def);results.push(r);if(r.status!=='PASSED')failures.push({capabilityId:def.id,missing:r.missing});});
 var output={framework:'SCIIP_V7_PLATFORM_INTEGRATION_CERTIFICATION',version:VERSION,status:failures.length?'FAILED':'PASSED',capabilitiesRun:results.length,results:results,failures:failures,dependencyCycles:registry.cycles,generatedAt:new Date().toISOString()};history.push(output);return clone(output);}
function snapshot(){return {version:VERSION,status:'AVAILABLE',certifications:clone(history)};}
return {VERSION:VERSION,certify:certify,snapshot:snapshot};
})();
function sciipPlatformCertificationV7(request){return SCIIP_PLATFORM_CERTIFIER.certify(request||{});}

/** SCIIP_OS v7.0 Sprint 4B — bootstrap declarations and retryable assembly. */
var SCIIP_PLATFORM_BOOTSTRAP=(function(){
'use strict';var VERSION='v7.0-integration-sprint-4b',bootstrapped=false;
function declare(){
 var defs=[
  {id:'platform-self-assembly',name:'Platform Self Assembly',version:VERSION,services:['platform-self-assembly'],queries:['platform-registry'],tests:['sciipTestV7PlatformRegistry','sciipTestV7PlatformSelfAssembly'],metadata:{compilerV2:true,noProcessors:true}},
  {id:'platform-certification',name:'Platform Integration Certification',version:VERSION,dependencies:['platform-self-assembly'],services:['platform-certification'],queries:['platform-certification'],tests:['sciipTestV7PlatformCertifier'],metadata:{compilerV2:true,noProcessors:true}}
 ];
 defs.forEach(function(d){SCIIP_PLATFORM_REGISTRY.register(d);});return SCIIP_PLATFORM_REGISTRY.snapshot();
}
function bootstrap(){declare();var assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'BOOTSTRAP'});bootstrapped=assembly.status==='WIRED';return {version:VERSION,status:bootstrapped?'WIRED':assembly.status,registry:SCIIP_PLATFORM_REGISTRY.snapshot(),assembly:assembly};}
function ensure(){return bootstrap();}
return {VERSION:VERSION,declare:declare,bootstrap:bootstrap,ensure:ensure,isBootstrapped:function(){return bootstrapped;}};
})();
function sciipPlatformBootstrapV7(){return SCIIP_PLATFORM_BOOTSTRAP.bootstrap();}

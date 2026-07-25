/** SCIIP_OS v7.0 Sprint 3E.1 — corrected retryable service wiring. */
var SCIIP_INTEGRATION_SPRINT3E_WIRING=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3e.1';
  var QUERY_NAME='governance.assurance';
  var LIVE_SERVICE_NAME='governance-assurance';

  function queryRegistered_(){
    try {
      if(typeof SCIIP_QUERY_ENGINE==='undefined'||!SCIIP_QUERY_ENGINE.snapshot)return false;
      var s=SCIIP_QUERY_ENGINE.snapshot()||{};
      return (s.registeredQueries||[]).indexOf(QUERY_NAME)!==-1;
    } catch(error){return false;}
  }

  function liveRegistered_(){
    try {
      if(typeof SCIIP_LIVE_RUNTIME==='undefined'||!SCIIP_LIVE_RUNTIME.snapshot)return false;
      var s=SCIIP_LIVE_RUNTIME.snapshot()||{};
      var services=s.services||[];
      for(var i=0;i<services.length;i+=1){
        var item=services[i];
        if((typeof item==='string'&&item===LIVE_SERVICE_NAME)||(item&&item.name===LIVE_SERVICE_NAME))return true;
      }
      return false;
    } catch(error){return false;}
  }

  function wire(){
    var q=queryRegistered_(), l=liveRegistered_(), w=typeof SCIIP_WORKFLOW_ENGINE!=='undefined';
    var errors=[];

    if(!q){
      try {
        if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&typeof SCIIP_QUERY_ENGINE.register==='function'){
          SCIIP_QUERY_ENGINE.register(QUERY_NAME,function(){return SCIIP_GOVERNANCE_ASSURANCE_WORKSPACE.snapshot();});
          q=queryRegistered_();
        }
      } catch(error){errors.push('QUERY:'+String(error));q=queryRegistered_();}
    }

    if(!l){
      try {
        if(typeof SCIIP_LIVE_RUNTIME!=='undefined'&&typeof SCIIP_LIVE_RUNTIME.register==='function'){
          SCIIP_LIVE_RUNTIME.register(LIVE_SERVICE_NAME,function(){return SCIIP_GOVERNANCE_ASSURANCE_WORKSPACE.snapshot();},{version:VERSION,scope:'GOVERNANCE_ASSURANCE'});
          l=liveRegistered_();
        }
      } catch(error2){errors.push('LIVE:'+String(error2));l=liveRegistered_();}
    }

    return {
      version:VERSION,
      status:(q&&l&&w)?'WIRED':'PARTIAL',
      queryRegistered:q,
      liveServiceRegistered:l,
      workflowAvailable:w,
      queryApi:typeof SCIIP_QUERY_ENGINE!=='undefined'&&typeof SCIIP_QUERY_ENGINE.register==='function'?'register':'UNAVAILABLE',
      liveRuntimeApi:typeof SCIIP_LIVE_RUNTIME!=='undefined'&&typeof SCIIP_LIVE_RUNTIME.register==='function'?'register':'UNAVAILABLE',
      errors:errors
    };
  }
  return {VERSION:VERSION,wire:wire};
})();
function sciipWireIntegrationSprint3E(){return SCIIP_INTEGRATION_SPRINT3E_WIRING.wire();}

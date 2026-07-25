/** SCIIP_OS v7.0 Sprint 3F.1 — retryable service wiring hotfix. */
var SCIIP_INTEGRATION_SPRINT3F_WIRING=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3f.1';
  var QUERY_NAME='release-assurance';
  var SERVICE_NAME='release-assurance';

  function servicePresent_(snapshot,name){
    var services=snapshot&&snapshot.services;
    if(!services)return false;
    if(Array.isArray(services)){
      for(var i=0;i<services.length;i+=1){
        var item=services[i];
        if(typeof item==='string'&&item===name)return true;
        if(item&&typeof item==='object'&&(item.name===name||item.id===name||item.service===name))return true;
      }
      return false;
    }
    return typeof services==='object'&&Object.prototype.hasOwnProperty.call(services,name);
  }

  function queryPresent_(snapshot,name){
    var registered=snapshot&&snapshot.registeredQueries;
    return Array.isArray(registered)&&registered.indexOf(name)!==-1;
  }

  function wire(){
    var out={version:VERSION,status:'PARTIAL',queryRegistered:false,liveServiceRegistered:false,workflowAvailable:typeof SCIIP_WORKFLOW_ENGINE!=='undefined',decisionLedgerAvailable:typeof SCIIP_DECISION_LEDGER!=='undefined',liveRuntimeApi:null,errors:[]};

    try{
      if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&typeof SCIIP_QUERY_ENGINE.register==='function'){
        var q1=SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{};
        if(!queryPresent_(q1,QUERY_NAME)){
          SCIIP_QUERY_ENGINE.register(QUERY_NAME,function(){return SCIIP_RESILIENCE_ASSURANCE_WORKSPACE.snapshot();});
        }
        var q2=SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{};
        out.queryRegistered=queryPresent_(q2,QUERY_NAME);
      }
    }catch(e1){out.errors.push('QUERY:'+String(e1));}

    try{
      if(typeof SCIIP_LIVE_RUNTIME!=='undefined'){
        out.liveRuntimeApi=typeof SCIIP_LIVE_RUNTIME.register==='function'?'register':null;
        if(typeof SCIIP_LIVE_RUNTIME.register==='function'){
          var s1=SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};
          if(!servicePresent_(s1,SERVICE_NAME)){
            SCIIP_LIVE_RUNTIME.register(SERVICE_NAME,function(){return SCIIP_RESILIENCE_ASSURANCE_WORKSPACE.snapshot();},{intervalMs:60000});
          }
          var s2=SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};
          out.liveServiceRegistered=servicePresent_(s2,SERVICE_NAME);
        }
      }
    }catch(e2){out.errors.push('LIVE:'+String(e2));}

    out.status=out.queryRegistered&&out.liveServiceRegistered&&out.workflowAvailable&&out.decisionLedgerAvailable?'WIRED':'PARTIAL';
    return out;
  }

  return {VERSION:VERSION,wire:wire};
})();

function sciipWireIntegrationSprint3F(){return SCIIP_INTEGRATION_SPRINT3F_WIRING.wire();}

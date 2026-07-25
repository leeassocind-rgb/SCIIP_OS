/** SCIIP_OS v7.0 Sprint 4A.1 — retryable service wiring hotfix. */
var SCIIP_INDUSTRIAL_INTELLIGENCE_WIRING=(function(){'use strict';var VERSION='v7.0-integration-sprint-4a.1';
function names_(items){return (items||[]).map(function(x){return typeof x==='string'?x:String((x&&x.name)||(x&&x.id)||(x&&x.service)||'');});}
function queryNames_(snapshot){
  snapshot=snapshot||{};
  if(Array.isArray(snapshot.registeredQueries))return names_(snapshot.registeredQueries);
  if(Array.isArray(snapshot.queries))return names_(snapshot.queries);
  if(Array.isArray(snapshot.registry))return names_(snapshot.registry);
  return [];
}
function serviceNames_(snapshot){return names_(snapshot&&snapshot.services||[]);}
function ensure(){
  var out={version:VERSION,status:'PARTIAL',queryRegistered:false,liveServiceRegistered:false,capabilityBuilderAvailable:typeof SCIIP_CAPABILITY_BUILDER!=='undefined',queryEngineApi:null,liveRuntimeApi:null,errors:[]};
  try{
    if(typeof SCIIP_QUERY_ENGINE!=='undefined'){
      out.queryEngineApi=typeof SCIIP_QUERY_ENGINE.register==='function'?'register':'UNAVAILABLE';
      var qs=typeof SCIIP_QUERY_ENGINE.snapshot==='function'?SCIIP_QUERY_ENGINE.snapshot():{};
      var qn=queryNames_(qs);
      if(qn.indexOf('industrial-intelligence')<0&&typeof SCIIP_QUERY_ENGINE.register==='function'){
        SCIIP_QUERY_ENGINE.register('industrial-intelligence',function(parameters){
          var result=SCIIP_INDUSTRIAL_INTELLIGENCE_WORKSPACE.snapshot(parameters||{});
          return Array.isArray(result)?result:[result];
        });
      }
      qs=typeof SCIIP_QUERY_ENGINE.snapshot==='function'?SCIIP_QUERY_ENGINE.snapshot():{};
      qn=queryNames_(qs);
      out.queryRegistered=qn.indexOf('industrial-intelligence')>=0;
    }
  }catch(e){out.errors.push('query:'+String(e));}
  try{
    if(typeof SCIIP_LIVE_RUNTIME!=='undefined'){
      out.liveRuntimeApi=typeof SCIIP_LIVE_RUNTIME.register==='function'?'register':'UNAVAILABLE';
      var ls=typeof SCIIP_LIVE_RUNTIME.snapshot==='function'?SCIIP_LIVE_RUNTIME.snapshot():{};
      var sn=serviceNames_(ls);
      if(sn.indexOf('industrial-intelligence')<0&&typeof SCIIP_LIVE_RUNTIME.register==='function'){
        SCIIP_LIVE_RUNTIME.register('industrial-intelligence',function(payload){return SCIIP_INDUSTRIAL_INTELLIGENCE_WORKSPACE.snapshot(payload||{});},{domain:'INDUSTRIAL_INTELLIGENCE'});
      }
      ls=typeof SCIIP_LIVE_RUNTIME.snapshot==='function'?SCIIP_LIVE_RUNTIME.snapshot():{};
      sn=serviceNames_(ls);
      out.liveServiceRegistered=sn.indexOf('industrial-intelligence')>=0;
    }
  }catch(e2){out.errors.push('live:'+String(e2));}
  out.status=out.queryRegistered&&out.liveServiceRegistered&&out.capabilityBuilderAvailable?'WIRED':'PARTIAL';
  return out;
}
return {VERSION:VERSION,ensure:ensure};})();
function sciipIndustrialIntelligenceWiringV7(){return SCIIP_INDUSTRIAL_INTELLIGENCE_WIRING.ensure();}

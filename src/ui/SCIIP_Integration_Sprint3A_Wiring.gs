/** SCIIP_OS v7.0 Integration Sprint 3A — load-order-safe intelligence service wiring. */
var SCIIP_SPRINT3A_WIRING=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3a.2';
  var queryRegistered=false, liveRegistered=false;

  function queryPresent_(){
    try{
      if(typeof SCIIP_QUERY_ENGINE==='undefined'||!SCIIP_QUERY_ENGINE.snapshot)return false;
      var snapshot=SCIIP_QUERY_ENGINE.snapshot();
      return snapshot&&snapshot.registeredQueries&&snapshot.registeredQueries.indexOf('enterprise-semantic-search')!==-1;
    }catch(error){return false;}
  }

  function livePresent_(){
    try{
      if(typeof SCIIP_LIVE_RUNTIME==='undefined'||!SCIIP_LIVE_RUNTIME.snapshot)return false;
      var snapshot=SCIIP_LIVE_RUNTIME.snapshot();
      return snapshot&&snapshot.services&&snapshot.services.some(function(service){return service.name==='enterprise-intelligence';});
    }catch(error){return false;}
  }

  function wire(){
    /* Do not latch "wired" before dependencies exist. Compiler bundle order can
       load this module before Sprint 2A's Query Engine and Live Runtime. */
    queryRegistered=queryPresent_();
    liveRegistered=livePresent_();

    if(!queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){
      SCIIP_QUERY_ENGINE.register('enterprise-semantic-search',function(parameters){
        return SCIIP_SEMANTIC_SEARCH.search(parameters||{}).results;
      });
      queryRegistered=queryPresent_();
    }

    if(!liveRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){
      SCIIP_LIVE_RUNTIME.register('enterprise-intelligence',function(payload){
        return SCIIP_INTELLIGENCE_ENGINE.analyze(payload||{});
      },{domain:'AI',readOnly:true});
      liveRegistered=livePresent_();
    }

    return {
      version:VERSION,
      status:queryRegistered&&liveRegistered?'WIRED':'PENDING_DEPENDENCIES',
      queryRegistered:queryRegistered,
      liveServiceRegistered:liveRegistered
    };
  }

  function snapshot(){
    var result=wire();
    result.queryEngineAvailable=typeof SCIIP_QUERY_ENGINE!=='undefined';
    result.liveRuntimeAvailable=typeof SCIIP_LIVE_RUNTIME!=='undefined';
    return result;
  }

  /* Best-effort initialization. Later calls safely retry after all bundles load. */
  wire();
  return {VERSION:VERSION,wire:wire,snapshot:snapshot};
})();

function sciipSprint3AServiceWiringSnapshotV7(){return SCIIP_SPRINT3A_WIRING.snapshot();}

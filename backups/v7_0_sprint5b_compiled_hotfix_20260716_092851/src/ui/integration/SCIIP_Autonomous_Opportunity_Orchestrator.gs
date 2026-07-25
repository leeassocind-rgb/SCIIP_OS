/** SCIIP_OS v7.0 Sprint 5B.1 — Autonomous Opportunity Orchestrator and resilient platform wiring. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-5b.1';

  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}

  function run(request){
    request=request||{};
    var detection=SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.detect({
      candidates:request.candidates||[],
      context:request.context||{},
      minimumScore:request.minimumScore||50
    });
    var top=detection.opportunities[0]||null;
    var confidence=SCIIP_CONFIDENCE_GOVERNANCE.assess({
      evidenceCount:request.evidenceCount||((top&&1)||0),
      sourceQuality:request.sourceQuality||80,
      freshness:request.freshness||80,
      consistency:request.consistency||80
    });
    var plan=null;
    if(top){
      plan=SCIIP_AUTONOMOUS_ACTION_PLANNER.build({
        opportunity:top,
        context:request.context||{},
        requireApproval:confidence.decision!=='AUTONOMOUS_ACTION_ALLOWED'
      });
    }
    return {
      version:VERSION,
      status:'COMPLETED',
      opportunity:top,
      confidence:confidence,
      actionPlan:plan,
      autonomous:confidence.decision==='AUTONOMOUS_ACTION_ALLOWED',
      generatedAt:new Date().toISOString()
    };
  }

  function platformDefinition(){
    return {
      id:'autonomous-opportunity-action-platform',
      version:VERSION,
      dependencies:['autonomous-industrial-intelligence'],
      queries:[{
        name:'autonomous-opportunity-search',
        handler:'sciipAutonomousOpportunitySearchV7'
      }],
      liveServices:[{
        name:'autonomous-opportunity-monitor',
        handler:'sciipAutonomousOpportunityHeartbeatV7'
      }],
      sharedState:true,
      eventBus:true,
      workspace:'autonomous-intelligence',
      tests:['sciipTestV7IntegrationSprint5B'],
      compiler:'v2',
      processors:false
    };
  }

  function queryNames_(){
    if(typeof SCIIP_QUERY_ENGINE==='undefined'||!SCIIP_QUERY_ENGINE)return [];
    var snapshot=typeof SCIIP_QUERY_ENGINE.snapshot==='function'?SCIIP_QUERY_ENGINE.snapshot():{};
    var raw=snapshot.registeredQueries||snapshot.queries||snapshot.registry||[];
    if(Array.isArray(raw)){
      return raw.map(function(item){
        if(typeof item==='string')return item;
        return String((item&&(
          item.name||item.id||item.query||item.key
        ))||'');
      }).filter(function(v){return !!v;});
    }
    if(raw&&typeof raw==='object')return Object.keys(raw);
    return [];
  }

  function liveServiceNames_(){
    if(typeof SCIIP_LIVE_RUNTIME==='undefined'||!SCIIP_LIVE_RUNTIME)return [];
    var snapshot=typeof SCIIP_LIVE_RUNTIME.snapshot==='function'?SCIIP_LIVE_RUNTIME.snapshot():{};
    var raw=snapshot.services||snapshot.registry||[];
    if(Array.isArray(raw)){
      return raw.map(function(item){
        if(typeof item==='string')return item;
        return String((item&&(
          item.name||item.id||item.service||item.key
        ))||'');
      }).filter(function(v){return !!v;});
    }
    if(raw&&typeof raw==='object')return Object.keys(raw);
    return [];
  }

  function registerQueryFallback_(result){
    if(queryNames_().indexOf('autonomous-opportunity-search')!==-1)return true;
    if(typeof SCIIP_QUERY_ENGINE==='undefined'||!SCIIP_QUERY_ENGINE||
       typeof SCIIP_QUERY_ENGINE.register!=='function'){
      result.errors.push('query:register API unavailable');
      return false;
    }
    try{
      SCIIP_QUERY_ENGINE.register(
        'autonomous-opportunity-search',
        function(request){return sciipAutonomousOpportunitySearchV7(request||{});},
        {capability:'autonomous-opportunity-action-platform',version:VERSION}
      );
    }catch(error){
      var message=String(error);
      if(message.toLowerCase().indexOf('already')===-1 &&
         message.toLowerCase().indexOf('duplicate')===-1){
        result.errors.push('query:'+message);
      }
    }
    return queryNames_().indexOf('autonomous-opportunity-search')!==-1;
  }

  function registerLiveFallback_(result){
    if(liveServiceNames_().indexOf('autonomous-opportunity-monitor')!==-1)return true;
    if(typeof SCIIP_LIVE_RUNTIME==='undefined'||!SCIIP_LIVE_RUNTIME||
       typeof SCIIP_LIVE_RUNTIME.register!=='function'){
      result.errors.push('live:register API unavailable');
      return false;
    }
    try{
      SCIIP_LIVE_RUNTIME.register(
        'autonomous-opportunity-monitor',
        function(){return sciipAutonomousOpportunityHeartbeatV7();},
        {capability:'autonomous-opportunity-action-platform',version:VERSION}
      );
    }catch(error){
      var message=String(error);
      if(message.toLowerCase().indexOf('already')===-1 &&
         message.toLowerCase().indexOf('duplicate')===-1){
        result.errors.push('live:'+message);
      }
    }
    return liveServiceNames_().indexOf('autonomous-opportunity-monitor')!==-1;
  }

  function wire(){
    var result={
      version:VERSION,
      status:'PARTIAL',
      registry:false,
      assembly:false,
      queryRegistered:false,
      liveServiceRegistered:false,
      queryEngineApi:null,
      liveRuntimeApi:null,
      registrationMode:[],
      queryNames:[],
      liveServiceNames:[],
      errors:[]
    };

    try{
      if(typeof SCIIP_PLATFORM_REGISTRY!=='undefined'&&
         SCIIP_PLATFORM_REGISTRY&&
         typeof SCIIP_PLATFORM_REGISTRY.register==='function'){
        SCIIP_PLATFORM_REGISTRY.register(platformDefinition());
        result.registry=true;
      }
    }catch(error){
      var registryMessage=String(error);
      if(registryMessage.toLowerCase().indexOf('duplicate')!==-1){
        result.registry=true;
      }else{
        result.errors.push('registry:'+registryMessage);
      }
    }

    try{
      if(typeof SCIIP_PLATFORM_SELF_ASSEMBLY!=='undefined'&&
         SCIIP_PLATFORM_SELF_ASSEMBLY&&
         typeof SCIIP_PLATFORM_SELF_ASSEMBLY.assemble==='function'){
        SCIIP_PLATFORM_SELF_ASSEMBLY.assemble();
        result.assembly=true;
        result.registrationMode.push('SELF_ASSEMBLY');
      }
    }catch(error2){
      result.errors.push('assembly:'+String(error2));
    }

    result.queryRegistered=queryNames_().indexOf('autonomous-opportunity-search')!==-1;
    result.liveServiceRegistered=liveServiceNames_().indexOf('autonomous-opportunity-monitor')!==-1;

    if(!result.queryRegistered){
      result.queryRegistered=registerQueryFallback_(result);
      if(result.queryRegistered)result.registrationMode.push('QUERY_FALLBACK');
    }
    if(!result.liveServiceRegistered){
      result.liveServiceRegistered=registerLiveFallback_(result);
      if(result.liveServiceRegistered)result.registrationMode.push('LIVE_FALLBACK');
    }

    result.queryEngineApi=
      typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE&&
      typeof SCIIP_QUERY_ENGINE.register==='function'?'register':'unavailable';
    result.liveRuntimeApi=
      typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME&&
      typeof SCIIP_LIVE_RUNTIME.register==='function'?'register':'unavailable';

    result.queryNames=queryNames_();
    result.liveServiceNames=liveServiceNames_();

    if(result.registry&&result.queryRegistered&&result.liveServiceRegistered){
      result.status='WIRED';
    }
    return result;
  }

  return {
    VERSION:VERSION,
    run:run,
    platformDefinition:platformDefinition,
    wire:wire
  };
})();

function sciipAutonomousOpportunitySearchV7(request){
  return SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.detect(request||{});
}
function sciipAutonomousOpportunityHeartbeatV7(){
  return {
    status:'AVAILABLE',
    version:'v7.0-integration-sprint-5b.1',
    timestamp:new Date().toISOString()
  };
}
function sciipAutonomousOpportunityRunV7(request){
  return SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR.run(request||{});
}

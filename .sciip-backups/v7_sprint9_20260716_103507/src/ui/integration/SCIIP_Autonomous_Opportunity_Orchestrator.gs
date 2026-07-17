/** SCIIP_OS v7.0 Sprint 5B.2 — compiled-deployment-safe autonomous opportunity orchestration. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-5b.2';

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
    var plan=top?SCIIP_AUTONOMOUS_ACTION_PLANNER.build({
      opportunity:top,
      context:request.context||{},
      requireApproval:confidence.decision!=='AUTONOMOUS_ACTION_ALLOWED'
    }):null;
    return {version:VERSION,status:'COMPLETED',opportunity:top,confidence:confidence,
      actionPlan:plan,autonomous:confidence.decision==='AUTONOMOUS_ACTION_ALLOWED',
      generatedAt:new Date().toISOString()};
  }

  function definition_(){
    return {
      id:'autonomous-opportunity-action-platform',
      version:VERSION,
      dependencies:['autonomous-industrial-intelligence'],
      queries:[{name:'autonomous-opportunity-search',handler:'sciipAutonomousOpportunitySearchV7'}],
      liveServices:[{name:'autonomous-opportunity-monitor',handler:'sciipAutonomousOpportunityHeartbeatV7'}],
      sharedState:true,eventBus:true,workspace:'autonomous-intelligence',
      tests:['sciipTestV7IntegrationSprint5B'],compiler:'v2',processors:false
    };
  }

  function names_(snapshot, keys){
    var raw=[];
    for(var i=0;i<keys.length;i+=1){
      if(snapshot&&snapshot[keys[i]]!=null){raw=snapshot[keys[i]];break;}
    }
    if(Array.isArray(raw))return raw.map(function(x){
      return typeof x==='string'?x:String((x&&(x.name||x.id||x.service||x.query||x.key))||'');
    }).filter(function(x){return !!x;});
    return raw&&typeof raw==='object'?Object.keys(raw):[];
  }

  function queryNames_(){
    if(typeof SCIIP_QUERY_ENGINE==='undefined'||!SCIIP_QUERY_ENGINE)return [];
    return names_(typeof SCIIP_QUERY_ENGINE.snapshot==='function'?SCIIP_QUERY_ENGINE.snapshot():{},
      ['registeredQueries','queries','registry']);
  }

  function serviceNames_(){
    if(typeof SCIIP_LIVE_RUNTIME==='undefined'||!SCIIP_LIVE_RUNTIME)return [];
    return names_(typeof SCIIP_LIVE_RUNTIME.snapshot==='function'?SCIIP_LIVE_RUNTIME.snapshot():{},
      ['services','registry']);
  }

  function wire(){
    var r={version:VERSION,status:'PARTIAL',registry:false,assembly:false,
      queryRegistered:false,liveServiceRegistered:false,registrationMode:[],
      queryEngineApi:'unavailable',liveRuntimeApi:'unavailable',errors:[]};

    try{
      if(typeof SCIIP_PLATFORM_REGISTRY!=='undefined'&&SCIIP_PLATFORM_REGISTRY&&
         typeof SCIIP_PLATFORM_REGISTRY.register==='function'){
        SCIIP_PLATFORM_REGISTRY.register(definition_());
        r.registry=true;
      }
    }catch(e){
      if(String(e).toLowerCase().indexOf('duplicate')!==-1)r.registry=true;
      else r.errors.push('registry:'+String(e));
    }

    try{
      if(typeof SCIIP_PLATFORM_SELF_ASSEMBLY!=='undefined'&&SCIIP_PLATFORM_SELF_ASSEMBLY&&
         typeof SCIIP_PLATFORM_SELF_ASSEMBLY.assemble==='function'){
        SCIIP_PLATFORM_SELF_ASSEMBLY.assemble();
        r.assembly=true;
        r.registrationMode.push('SELF_ASSEMBLY');
      }
    }catch(e2){r.errors.push('assembly:'+String(e2));}

    r.queryRegistered=queryNames_().indexOf('autonomous-opportunity-search')!==-1;
    if(!r.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE&&
       typeof SCIIP_QUERY_ENGINE.register==='function'){
      r.queryEngineApi='register';
      try{
        SCIIP_QUERY_ENGINE.register('autonomous-opportunity-search',
          function(req){return sciipAutonomousOpportunitySearchV7(req||{});},
          {capability:'autonomous-opportunity-action-platform',version:VERSION});
      }catch(e3){
        var m3=String(e3).toLowerCase();
        if(m3.indexOf('duplicate')===-1&&m3.indexOf('already')===-1)r.errors.push('query:'+String(e3));
      }
      r.queryRegistered=queryNames_().indexOf('autonomous-opportunity-search')!==-1;
      if(r.queryRegistered)r.registrationMode.push('QUERY_FALLBACK');
    } else if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE&&
              typeof SCIIP_QUERY_ENGINE.register==='function')r.queryEngineApi='register';

    r.liveServiceRegistered=serviceNames_().indexOf('autonomous-opportunity-monitor')!==-1;
    if(!r.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME&&
       typeof SCIIP_LIVE_RUNTIME.register==='function'){
      r.liveRuntimeApi='register';
      try{
        SCIIP_LIVE_RUNTIME.register('autonomous-opportunity-monitor',
          function(){return sciipAutonomousOpportunityHeartbeatV7();},
          {capability:'autonomous-opportunity-action-platform',version:VERSION});
      }catch(e4){
        var m4=String(e4).toLowerCase();
        if(m4.indexOf('duplicate')===-1&&m4.indexOf('already')===-1)r.errors.push('live:'+String(e4));
      }
      r.liveServiceRegistered=serviceNames_().indexOf('autonomous-opportunity-monitor')!==-1;
      if(r.liveServiceRegistered)r.registrationMode.push('LIVE_FALLBACK');
    } else if(typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME&&
              typeof SCIIP_LIVE_RUNTIME.register==='function')r.liveRuntimeApi='register';

    if(r.registry&&r.queryRegistered&&r.liveServiceRegistered)r.status='WIRED';
    return r;
  }

  return {VERSION:VERSION,run:run,platformDefinition:definition_,wire:wire};
})();

function sciipAutonomousOpportunitySearchV7(request){
  return SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.detect(request||{});
}
function sciipAutonomousOpportunityHeartbeatV7(){
  return {status:'AVAILABLE',version:'v7.0-integration-sprint-5b.2',timestamp:new Date().toISOString()};
}
function sciipAutonomousOpportunityRunV7(request){
  return SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR.run(request||{});
}

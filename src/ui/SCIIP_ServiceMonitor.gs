/** SCIIP_OS v7.0 Integration Sprint 2B — service diagnostics and reactive executive metrics. */
var SCIIP_SERVICE_MONITOR=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-2b', startedAt=Date.now(), samples=[], queryRuns=0, queryHits=0;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));} function now_(){return new Date().toISOString();}
  function recordQuery(result){queryRuns++;if(result&&result.cacheHit)queryHits++;return true;}
  function collect(){
    var live=typeof SCIIP_LIVE_RUNTIME!=='undefined'?SCIIP_LIVE_RUNTIME.snapshot():{status:'UNAVAILABLE',services:[],queueDepth:0,history:[]};
    var query=typeof SCIIP_QUERY_ENGINE!=='undefined'?SCIIP_QUERY_ENGINE.snapshot():{status:'UNAVAILABLE',registeredQueries:[],cacheEntries:0,executions:{}};
    var reactive=typeof SCIIP_REACTIVE_BINDINGS!=='undefined'?SCIIP_REACTIVE_BINDINGS.snapshot():{status:'UNAVAILABLE',bindingCount:0};
    var presence=typeof SCIIP_PRESENCE_SERVICE!=='undefined'?SCIIP_PRESENCE_SERVICE.snapshot():{total:0,counts:{ACTIVE:0,IDLE:0,OFFLINE:0}};
    var latencies=(live.services||[]).map(function(s){return Number(s.lastLatencyMs)||0;}).filter(function(v){return v>=0;});
    var avg=latencies.length?latencies.reduce(function(a,b){return a+b;},0)/latencies.length:0;
    var result={version:VERSION,status:live.status==='AVAILABLE'?'OPERATIONAL':'DEGRADED',generatedAt:now_(),uptimeMs:Date.now()-startedAt,queueDepth:Number(live.queueDepth||0),serviceCount:(live.services||[]).length,averageLatencyMs:Math.round(avg*100)/100,cacheEntries:Number(query.cacheEntries||0),cacheHitRatio:queryRuns?Math.round((queryHits/queryRuns)*10000)/10000:0,queryRuns:queryRuns,reactiveBindingCount:Number(reactive.bindingCount||0),presence:clone_(presence.counts||{}),synchronizationHealth:live.status||'UNAVAILABLE'};
    samples.push(clone_(result));if(samples.length>100)samples.shift();return result;
  }
  function dashboard(){var metrics=collect();return {version:VERSION,status:metrics.status,kpis:[{id:'uptime',label:'Runtime Uptime',value:String(Math.floor(metrics.uptimeMs/1000))+'s'},{id:'queue',label:'Queue Depth',value:String(metrics.queueDepth)},{id:'latency',label:'Average Latency',value:String(metrics.averageLatencyMs)+' ms'},{id:'cache',label:'Cache Hit Ratio',value:String(Math.round(metrics.cacheHitRatio*100))+'%'},{id:'presence',label:'Active Presence',value:String(metrics.presence.ACTIVE||0)}],metrics:metrics};}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',samples:clone_(samples.slice(-25)),latest:collect()};}
  return {VERSION:VERSION,recordQuery:recordQuery,collect:collect,dashboard:dashboard,snapshot:snapshot};
})();
function sciipServiceMonitorSnapshotV7(){return SCIIP_SERVICE_MONITOR.snapshot();}
function sciipReactiveExecutiveDashboardV7(){return SCIIP_SERVICE_MONITOR.dashboard();}

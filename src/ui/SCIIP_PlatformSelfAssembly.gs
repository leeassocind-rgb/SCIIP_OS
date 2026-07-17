/** SCIIP_OS v7.0 Sprint 4B — dependency-aware self-assembly. */
var SCIIP_PLATFORM_SELF_ASSEMBLY=(function(){
'use strict';var VERSION='v7.0-integration-sprint-4b', runs=[], subscriptions={};
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function resolveHandler(symbol,fallback){if(!symbol)return fallback;try{var root=(function(){return this;})();var fn=root[symbol];return typeof fn==='function'?fn:fallback;}catch(e){return fallback;}}
function defaultHandler(payload){return {status:'AVAILABLE',payload:clone(payload||{}),generatedAt:new Date().toISOString()};}
function assembleOne(def){var result={capabilityId:def.id,status:'WIRED',queries:[],services:[],events:[],stateBindings:[],workspaces:def.workspaces.slice(),errors:[]};
 var qh=resolveHandler(def.queryHandler,defaultHandler),lh=resolveHandler(def.liveHandler,defaultHandler);
 def.queries.forEach(function(name){try{var r=SCIIP_PLATFORM_ADAPTERS.registerQuery(name,qh);result.queries.push({name:name,registered:r.registered,available:r.available});if(!r.registered)result.status='PARTIAL';}catch(e){result.status='FAILED';result.errors.push('query:'+name+':'+e);}});
 def.services.forEach(function(name){try{var r=SCIIP_PLATFORM_ADAPTERS.registerLive(name,lh,{capabilityId:def.id,domain:'PLATFORM_SELF_ASSEMBLY'});result.services.push({name:name,registered:r.registered,available:r.available});if(!r.registered)result.status='PARTIAL';}catch(e2){result.status='FAILED';result.errors.push('service:'+name+':'+e2);}});
 if(def.events.length){if(!SCIIP_PLATFORM_ADAPTERS.hasEventBus()){result.status='PARTIAL';result.errors.push('event-bus:UNAVAILABLE');}else def.events.forEach(function(type){var key=def.id+'|'+type;if(!subscriptions[key])subscriptions[key]=SCIIP_APP_EVENTS.subscribe(type,function(){});result.events.push({type:type,subscribed:!!subscriptions[key]});});}
 if(def.stateBindings.length){if(!SCIIP_PLATFORM_ADAPTERS.hasState()){result.status='PARTIAL';result.errors.push('state:UNAVAILABLE');}else def.stateBindings.forEach(function(binding){var key=def.id+'|state|'+binding;if(!subscriptions[key])subscriptions[key]=SCIIP_APP_STATE.subscribe(function(){});result.stateBindings.push({binding:binding,subscribed:!!subscriptions[key]});});}
 return result;}
function assemble(request){request=request||{};var snap=SCIIP_PLATFORM_REGISTRY.snapshot(),results=[],status='WIRED';if(snap.cycles.length)return {version:VERSION,status:'FAILED',reason:'DEPENDENCY_CYCLE',cycles:snap.cycles,results:[]};
 snap.dependencyOrder.forEach(function(id){var def=SCIIP_PLATFORM_REGISTRY.get(id);if(!def||!def.enabled)return;var r=assembleOne(def);results.push(r);if(r.status==='FAILED')status='FAILED';else if(r.status!=='WIRED'&&status!=='FAILED')status='PARTIAL';});
 var run={id:'assembly-'+(runs.length+1),version:VERSION,status:status,results:results,generatedAt:new Date().toISOString(),source:String(request.source||'MANUAL')};runs.push(run);return clone(run);}
function snapshot(){return {version:VERSION,status:'AVAILABLE',runs:clone(runs),subscriptions:Object.keys(subscriptions).length};}
return {VERSION:VERSION,assemble:assemble,snapshot:snapshot};
})();
function sciipPlatformAssembleV7(request){return SCIIP_PLATFORM_SELF_ASSEMBLY.assemble(request||{});}

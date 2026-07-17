/** SCIIP_OS v7.0 Sprint 4B — normalized adapters for certified platform services. */
var SCIIP_PLATFORM_ADAPTERS=(function(){
'use strict';var VERSION='v7.0-integration-sprint-4b';
function text(v){return String(v==null?'':v);}
function namesFrom(value,keys){value=value||{};var rows=[];for(var i=0;i<keys.length;i+=1){if(Array.isArray(value[keys[i]])){rows=value[keys[i]];break;}}return rows.map(function(x){return typeof x==='string'?x:text(x&& (x.name||x.id||x.service||x.query||x.workspace));}).filter(function(x){return !!x;});}
function queryNames(){if(typeof SCIIP_QUERY_ENGINE==='undefined')return [];var s=typeof SCIIP_QUERY_ENGINE.snapshot==='function'?SCIIP_QUERY_ENGINE.snapshot():{};return namesFrom(s,['registeredQueries','queries','registry']);}
function liveNames(){if(typeof SCIIP_LIVE_RUNTIME==='undefined')return [];var s=typeof SCIIP_LIVE_RUNTIME.snapshot==='function'?SCIIP_LIVE_RUNTIME.snapshot():{};return namesFrom(s,['services','registeredServices','registry']);}
function workspaceNames(){var out=[];if(typeof SCIIP_DESKTOP!=='undefined'&&SCIIP_DESKTOP.WORKSPACES){out=SCIIP_DESKTOP.WORKSPACES.map(function(x){return text(x&&x.id);});}return out.filter(function(x){return !!x;});}
function registerQuery(name,handler){if(typeof SCIIP_QUERY_ENGINE==='undefined'||typeof SCIIP_QUERY_ENGINE.register!=='function')return {available:false,registered:false,reason:'QUERY_ENGINE_UNAVAILABLE'};if(queryNames().indexOf(name)<0)SCIIP_QUERY_ENGINE.register(name,handler);return {available:true,registered:queryNames().indexOf(name)>=0};}
function registerLive(name,handler,options){if(typeof SCIIP_LIVE_RUNTIME==='undefined'||typeof SCIIP_LIVE_RUNTIME.register!=='function')return {available:false,registered:false,reason:'LIVE_RUNTIME_UNAVAILABLE'};if(liveNames().indexOf(name)<0)SCIIP_LIVE_RUNTIME.register(name,handler,options||{});return {available:true,registered:liveNames().indexOf(name)>=0};}
function hasEventBus(){return typeof SCIIP_APP_EVENTS!=='undefined'&&typeof SCIIP_APP_EVENTS.subscribe==='function';}
function hasState(){return typeof SCIIP_APP_STATE!=='undefined'&&typeof SCIIP_APP_STATE.subscribe==='function';}
return {VERSION:VERSION,queryNames:queryNames,liveNames:liveNames,workspaceNames:workspaceNames,registerQuery:registerQuery,registerLive:registerLive,hasEventBus:hasEventBus,hasState:hasState};
})();

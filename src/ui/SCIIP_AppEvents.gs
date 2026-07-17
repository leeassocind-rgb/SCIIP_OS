/** SCIIP_OS v7.0 Integration Sprint 1 — application event bus. */
var SCIIP_APP_EVENTS = (function () {
  'use strict';
  var VERSION='v7.0-integration-sprint-1', MAX_HISTORY=200, nextId=1, subscribers={}, history=[];
  var TYPES={PROPERTY_SELECTED:'PROPERTY_SELECTED',COMPANY_SELECTED:'COMPANY_SELECTED',MARKET_SELECTED:'MARKET_SELECTED',GRAPH_NODE_SELECTED:'GRAPH_NODE_SELECTED',MAP_FEATURE_SELECTED:'MAP_FEATURE_SELECTED',WORKSPACE_CHANGED:'WORKSPACE_CHANGED',SEARCH_CHANGED:'SEARCH_CHANGED',FILTER_CHANGED:'FILTER_CHANGED',CONTEXT_CLEARED:'CONTEXT_CLEARED',NOTIFICATION_CREATED:'NOTIFICATION_CREATED'};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function subscribe(type,handler){if(typeof handler!=='function')throw new Error('SCIIP_APP_EVENTS handler must be a function.');var id='event-'+nextId++;subscribers[id]={type:String(type||'*'),handler:handler,once:false};return id;}
  function once(type,handler){var id=subscribe(type,handler);subscribers[id].once=true;return id;}
  function unsubscribe(idOrHandler){var removed=false;Object.keys(subscribers).forEach(function(id){if(id===idOrHandler||subscribers[id].handler===idOrHandler){delete subscribers[id];removed=true;}});return removed;}
  function publish(type,payload,meta){
    var event={id:'evt-'+Date.now()+'-'+nextId++,type:String(type),payload:clone_(payload||{}),meta:clone_(meta||{}),timestamp:new Date().toISOString()};
    history.push(event);if(history.length>MAX_HISTORY)history.shift();
    Object.keys(subscribers).forEach(function(id){var sub=subscribers[id];if(!sub||(sub.type!=='*'&&sub.type!==event.type))return;try{sub.handler(clone_(event));}catch(error){event.subscriberErrors=(event.subscriberErrors||0)+1;}if(sub.once)delete subscribers[id];});
    return clone_(event);
  }
  function getHistory(filter){filter=filter||{};return clone_(history.filter(function(e){return !filter.type||e.type===filter.type;}).slice(-(filter.limit||MAX_HISTORY)));}
  function clearHistory(){history=[];return true;}
  return {VERSION:VERSION,TYPES:TYPES,publish:publish,subscribe:subscribe,unsubscribe:unsubscribe,once:once,history:getHistory,clearHistory:clearHistory};
})();

function sciipAppEventHistoryV7(type,limit){return SCIIP_APP_EVENTS.history({type:type||null,limit:limit||50});}

/** SCIIP_OS v7.0 Integration Sprint 1 — canonical application state. */
var SCIIP_APP_STATE = (function () {
  'use strict';
  var VERSION = 'v7.0-integration-sprint-1';
  var DEFAULTS = {
    selectedProperty:null, selectedCompany:null, selectedMarket:null,
    selectedGraphNode:null, selectedMapFeature:null,
    currentWorkspace:'executive-dashboard', globalSearchText:'', activeFilters:{},
    mapExtent:null, userSession:null,
    loading:{active:false, scope:null, message:null}, error:null,
    notifications:[], revision:0, updatedAt:null
  };
  var state = clone_(DEFAULTS), subscriptions = {}, nextId = 1;
  function clone_(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now_() { return new Date().toISOString(); }
  function notify_(previous, changedKeys, meta) {
    var payload={state:snapshot(), previous:clone_(previous), changedKeys:changedKeys.slice(), meta:clone_(meta||{}), timestamp:now_()};
    Object.keys(subscriptions).forEach(function(id){ try{subscriptions[id](payload);}catch(error){ /* subscriber isolation */ } });
  }
  function commit_(next, changedKeys, meta) {
    var previous=state; next.revision=(Number(previous.revision)||0)+1; next.updatedAt=now_(); state=next; notify_(previous,changedKeys,meta); return snapshot();
  }
  function get(path) {
    if (!path) return snapshot();
    var cursor=state, parts=String(path).split('.');
    for(var i=0;i<parts.length;i+=1){ if(cursor==null)return undefined; cursor=cursor[parts[i]]; }
    return clone_(cursor);
  }
  function set(key,value,meta) { var next=clone_(state); next[key]=clone_(value); return commit_(next,[key],meta); }
  function patch(values,meta) {
    values=values||{}; var next=clone_(state), changed=[];
    Object.keys(values).forEach(function(key){ next[key]=clone_(values[key]); changed.push(key); });
    return changed.length ? commit_(next,changed,meta) : snapshot();
  }
  function subscribe(handler) { if(typeof handler!=='function')throw new Error('SCIIP_APP_STATE subscriber must be a function.'); var id='state-'+nextId++; subscriptions[id]=handler; return id; }
  function unsubscribe(idOrHandler) { var removed=false; Object.keys(subscriptions).forEach(function(id){if(id===idOrHandler||subscriptions[id]===idOrHandler){delete subscriptions[id];removed=true;}}); return removed; }
  function reset(meta) { return commit_(clone_(DEFAULTS),Object.keys(DEFAULTS),meta||{reason:'RESET'}); }
  function snapshot() { return clone_(state); }
  function restore(saved,meta) {
    if(!saved||typeof saved!=='object')throw new Error('SCIIP_APP_STATE restoration requires an object snapshot.');
    var next=clone_(DEFAULTS); Object.keys(DEFAULTS).forEach(function(k){if(Object.prototype.hasOwnProperty.call(saved,k))next[k]=clone_(saved[k]);});
    return commit_(next,Object.keys(next),meta||{reason:'RESTORE'});
  }
  return {VERSION:VERSION,get:get,set:set,patch:patch,subscribe:subscribe,unsubscribe:unsubscribe,reset:reset,snapshot:snapshot,restore:restore};
})();

function sciipAppStateSnapshotV7(){ return SCIIP_APP_STATE.snapshot(); }
function sciipAppStateRestoreV7(snapshot){ return SCIIP_APP_STATE.restore(snapshot,{source:'APPS_SCRIPT_PUBLIC_API'}); }

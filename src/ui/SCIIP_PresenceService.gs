/** SCIIP_OS v7.0 Integration Sprint 2B — read-only collaboration presence foundation. */
var SCIIP_PRESENCE_SERVICE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-2b', sessions={}, IDLE_MS=300000, OFFLINE_MS=900000;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));} function now_(){return new Date().toISOString();}
  function upsert(input){input=input||{};var id=String(input.sessionId||input.userId||'').trim();if(!id)throw new Error('PRESENCE_SESSION_REQUIRED');var prior=sessions[id]||{};sessions[id]={sessionId:id,userId:input.userId||prior.userId||id,displayName:input.displayName||prior.displayName||'SCIIP User',workspace:input.workspace||prior.workspace||'executive-dashboard',selectedEntity:clone_(typeof input.selectedEntity==='undefined'?prior.selectedEntity||null:input.selectedEntity),cursor:clone_(typeof input.cursor==='undefined'?prior.cursor||null:input.cursor),editing:input.editing===true,lastActivityAt:input.lastActivityAt||now_(),heartbeatAt:now_(),readOnly:true};return clone_(sessions[id]);}
  function heartbeat(sessionId,patch){patch=patch||{};patch.sessionId=sessionId;return upsert(patch);}
  function status_(s,at){var age=at-new Date(s.heartbeatAt).getTime();return age>=OFFLINE_MS?'OFFLINE':age>=IDLE_MS?'IDLE':'ACTIVE';}
  function list(at){var t=new Date(at||now_()).getTime();return Object.keys(sessions).sort().map(function(id){var x=clone_(sessions[id]);x.status=status_(x,t);return x;});}
  function remove(id){if(!sessions[id])return false;delete sessions[id];return true;}
  function snapshot(at){var items=list(at),counts={ACTIVE:0,IDLE:0,OFFLINE:0};items.forEach(function(x){counts[x.status]++;});return {version:VERSION,status:'AVAILABLE',readOnly:true,total:items.length,counts:counts,sessions:items};}
  return {VERSION:VERSION,upsert:upsert,heartbeat:heartbeat,list:list,remove:remove,snapshot:snapshot};
})();
function sciipPresenceHeartbeatV7(sessionId,patch){return SCIIP_PRESENCE_SERVICE.heartbeat(sessionId,patch||{});}
function sciipPresenceSnapshotV7(){return SCIIP_PRESENCE_SERVICE.snapshot();}

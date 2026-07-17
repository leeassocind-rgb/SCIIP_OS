/** SCIIP_OS v7.0 Integration Sprint 3C — event-sourced digital twin registry. */
var SCIIP_DIGITAL_TWIN_REGISTRY=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3c',nextEventId=1,events=[],current={};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function now_(){return new Date().toISOString();}
  function id_(entity){return String(entity.twinId||entity.propertyId||entity.companyId||entity.marketId||entity.id||'').trim();}
  function append(type,entity,meta){entity=entity||{};var id=id_(entity);if(!id)throw new Error('DIGITAL_TWIN_ID_REQUIRED');var previous=current[id]||null;var revision=previous?Number(previous.revision||0)+1:1;var snapshot=clone_(entity);snapshot.twinId=id;snapshot.entityType=String(entity.entityType||entity.type||'PROPERTY').toUpperCase();snapshot.revision=revision;snapshot.updatedAt=now_();snapshot.source=entity.source||'SCIIP_OS';var event={id:'twin-event-'+nextEventId++,type:String(type||'TWIN_UPDATED'),twinId:id,entityType:snapshot.entityType,revision:revision,snapshot:clone_(snapshot),meta:clone_(meta||{}),timestamp:snapshot.updatedAt};events.push(event);if(events.length>1000)events.shift();current[id]=snapshot;try{if(typeof SCIIP_APP_EVENTS!=='undefined')SCIIP_APP_EVENTS.publish(event.type,{twin:snapshot,eventId:event.id},{source:'SCIIP_DIGITAL_TWIN_REGISTRY'});}catch(ignore){}return clone_(event);}
  function register(entity,meta){var id=id_(entity||{});if(current[id])return {status:'DUPLICATE_SAFE',twin:clone_(current[id]),event:null};var event=append('TWIN_REGISTERED',entity,meta);return {status:'CREATED',twin:clone_(current[id_(entity)]),event:event};}
  function update(id,patch,meta){id=String(id||'').trim();if(!current[id])throw new Error('DIGITAL_TWIN_NOT_FOUND');var next=clone_(current[id]);Object.keys(patch||{}).forEach(function(k){if(['twinId','revision','updatedAt'].indexOf(k)===-1)next[k]=clone_(patch[k]);});var event=append('TWIN_UPDATED',next,meta);return {status:'UPDATED',twin:clone_(current[id]),event:event};}
  function get(id){return clone_(current[String(id||'')]||null);}
  function list(filter){filter=filter||{};return Object.keys(current).map(function(k){return current[k];}).filter(function(t){return (!filter.entityType||t.entityType===String(filter.entityType).toUpperCase())&&(!filter.marketId||t.marketId===filter.marketId)&&(!filter.status||t.status===filter.status);}).map(clone_);}
  function history(id){return events.filter(function(e){return !id||e.twinId===id;}).map(clone_);}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',twins:list({}),events:clone_(events),twinCount:Object.keys(current).length,eventCount:events.length};}
  function reset(){nextEventId=1;events=[];current={};return true;}
  return {VERSION:VERSION,register:register,update:update,get:get,list:list,history:history,snapshot:snapshot,reset:reset};
})();
function sciipDigitalTwinSnapshotV7(){return SCIIP_DIGITAL_TWIN_REGISTRY.snapshot();}

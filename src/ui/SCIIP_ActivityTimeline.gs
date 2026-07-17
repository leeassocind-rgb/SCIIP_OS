/** SCIIP_OS v7.0 Integration Sprint 2B — immutable enterprise activity timeline. */
var SCIIP_ACTIVITY_TIMELINE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-2b', MAX_EVENTS=1000, events=[], subscribers={}, nextId=1, nextSub=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function now_(){return new Date().toISOString();}
  function append(type,payload,meta){
    type=String(type||'').trim(); if(!type)throw new Error('ACTIVITY_TYPE_REQUIRED');
    var event={id:'activity-'+nextId++,type:type,payload:clone_(payload||{}),meta:clone_(meta||{}),timestamp:now_(),immutable:true};
    events.push(event); if(events.length>MAX_EVENTS)events.shift();
    Object.keys(subscribers).forEach(function(id){try{subscribers[id](clone_(event));}catch(error){}});
    return clone_(event);
  }
  function list(filter){filter=filter||{};var result=events.filter(function(e){return (!filter.type||e.type===filter.type)&&(!filter.workspace||e.meta.workspace===filter.workspace)&&(!filter.entityId||e.meta.entityId===filter.entityId);});var limit=Math.max(1,Math.min(Number(filter.limit)||100,MAX_EVENTS));return clone_(result.slice(-limit));}
  function replay(fromId,handler){if(typeof handler!=='function')throw new Error('ACTIVITY_REPLAY_HANDLER_REQUIRED');var start=0;if(fromId){for(var i=0;i<events.length;i++)if(events[i].id===fromId){start=i;break;}}var count=0;for(var j=start;j<events.length;j++){handler(clone_(events[j]));count++;}return count;}
  function undoDescriptor(eventId){for(var i=0;i<events.length;i++)if(events[i].id===eventId)return {eventId:eventId,supported:!!events[i].meta.undoAction,undoAction:clone_(events[i].meta.undoAction||null)};return null;}
  function subscribe(handler){if(typeof handler!=='function')throw new Error('ACTIVITY_SUBSCRIBER_REQUIRED');var id='activity-sub-'+nextSub++;subscribers[id]=handler;return id;}
  function unsubscribe(id){if(!subscribers[id])return false;delete subscribers[id];return true;}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',count:events.length,subscriberCount:Object.keys(subscribers).length,recent:clone_(events.slice(-25))};}
  return {VERSION:VERSION,append:append,list:list,replay:replay,undoDescriptor:undoDescriptor,subscribe:subscribe,unsubscribe:unsubscribe,snapshot:snapshot};
})();
function sciipActivityAppendV7(type,payload,meta){return SCIIP_ACTIVITY_TIMELINE.append(type,payload||{},meta||{});}
function sciipActivityTimelineSnapshotV7(){return SCIIP_ACTIVITY_TIMELINE.snapshot();}

/** SCIIP_OS v7.0 Integration Sprint 3D — event-sourced scenario registry. */
var SCIIP_SCENARIO_REGISTRY=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3d',scenarios={},events=[],nextId=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function now_(){return new Date().toISOString();}
  function append_(type,scenario,meta){var event={id:'scenario-event-'+nextId++,type:type,scenarioId:scenario.id,revision:scenario.revision,snapshot:clone_(scenario),meta:clone_(meta||{}),timestamp:now_()};events.push(event);if(events.length>1000)events.shift();try{if(typeof SCIIP_APP_EVENTS!=='undefined')SCIIP_APP_EVENTS.publish(type,{scenario:scenario,eventId:event.id},{source:'SCIIP_SCENARIO_REGISTRY'});}catch(ignore){}return event;}
  function create(request,meta){request=request||{};var id=String(request.id||request.scenarioId||'').trim();if(!id)throw new Error('SCENARIO_ID_REQUIRED');if(scenarios[id])return {status:'DUPLICATE_SAFE',scenario:clone_(scenarios[id]),event:null};var s={id:id,label:request.label||id,description:request.description||'',portfolioId:request.portfolioId||null,baselineId:request.baselineId||null,assumptions:clone_(request.assumptions||{}),constraints:clone_(request.constraints||{}),weights:clone_(request.weights||{}),status:'DRAFT',revision:1,createdAt:now_(),updatedAt:now_()};scenarios[id]=s;return {status:'CREATED',scenario:clone_(s),event:append_('SCENARIO_CREATED',s,meta)};}
  function patch(id,values,meta){var s=scenarios[String(id||'')];if(!s)throw new Error('SCENARIO_NOT_FOUND');Object.keys(values||{}).forEach(function(k){if(['id','revision','createdAt'].indexOf(k)===-1)s[k]=clone_(values[k]);});s.revision++;s.updatedAt=now_();return {status:'UPDATED',scenario:clone_(s),event:append_('SCENARIO_UPDATED',s,meta)};}
  function setStatus(id,status,meta){status=String(status||'').toUpperCase();if(['DRAFT','READY','RUNNING','COMPLETED','FAILED','ARCHIVED'].indexOf(status)===-1)throw new Error('SCENARIO_STATUS_INVALID');return patch(id,{status:status},meta);}
  function get(id){return clone_(scenarios[String(id||'')]||null);}
  function list(filter){filter=filter||{};return Object.keys(scenarios).map(function(k){return scenarios[k];}).filter(function(s){return !filter.status||s.status===String(filter.status).toUpperCase();}).map(clone_);}
  function history(id){return events.filter(function(e){return !id||e.scenarioId===id;}).map(clone_);}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',scenarioCount:Object.keys(scenarios).length,eventCount:events.length,scenarios:list({}),events:clone_(events)};}
  function reset(){scenarios={};events=[];nextId=1;return true;}
  return {VERSION:VERSION,create:create,patch:patch,setStatus:setStatus,get:get,list:list,history:history,snapshot:snapshot,reset:reset};
})();
function sciipScenarioRegistrySnapshotV7(){return SCIIP_SCENARIO_REGISTRY.snapshot();}

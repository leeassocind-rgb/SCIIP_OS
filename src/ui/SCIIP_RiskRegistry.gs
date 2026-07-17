/** SCIIP_OS v7.0 Sprint 3E — event-sourced enterprise risk registry. */
var SCIIP_RISK_REGISTRY=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3e', risks={}, events=[], nextEvent=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function now_(){return new Date().toISOString();}
  function score_(likelihood,impact){return Math.max(0,Math.min(25,Number(likelihood||0)*Number(impact||0)));}
  function level_(score){return score>=20?'CRITICAL':score>=12?'HIGH':score>=6?'MEDIUM':'LOW';}
  function record_(type,id,payload){var e={eventId:'risk-event-'+nextEvent++,type:type,riskId:id,payload:clone_(payload),timestamp:now_()};events.push(e);return e;}
  function create(input){input=input||{};var id=String(input.riskId||input.id||'').trim();if(!id)throw new Error('RISK_ID_REQUIRED');if(risks[id])return clone_(risks[id]);var score=score_(input.likelihood,input.impact);risks[id]={riskId:id,title:String(input.title||id),category:String(input.category||'GENERAL'),likelihood:Number(input.likelihood||0),impact:Number(input.impact||0),score:score,level:level_(score),status:'OPEN',owner:input.owner||null,mitigation:input.mitigation||null,revision:1,createdAt:now_(),updatedAt:now_()};record_('RISK_CREATED',id,risks[id]);return clone_(risks[id]);}
  function update(id,patch){id=String(id);if(!risks[id])throw new Error('RISK_NOT_FOUND');patch=patch||{};var r=risks[id];Object.keys(patch).forEach(function(k){if(k!=='riskId'&&k!=='revision'&&k!=='createdAt')r[k]=clone_(patch[k]);});r.score=score_(r.likelihood,r.impact);r.level=level_(r.score);r.revision+=1;r.updatedAt=now_();record_('RISK_UPDATED',id,r);return clone_(r);}
  function mitigate(id,note){return update(id,{status:'MITIGATED',mitigation:note||risks[id].mitigation});}
  function get(id){return clone_(risks[String(id)]||null);}
  function list(filter){filter=filter||{};return Object.keys(risks).map(function(k){return clone_(risks[k]);}).filter(function(r){return (!filter.status||r.status===filter.status)&&(!filter.level||r.level===filter.level);});}
  function history(id){return clone_(events.filter(function(e){return !id||e.riskId===id;}));}
  function reset(){risks={};events=[];nextEvent=1;}
  return {VERSION:VERSION,create:create,update:update,mitigate:mitigate,get:get,list:list,history:history,reset:reset,score:score_};
})();
function sciipRiskRegistrySnapshotV7(){return {version:SCIIP_RISK_REGISTRY.VERSION,risks:SCIIP_RISK_REGISTRY.list({}),events:SCIIP_RISK_REGISTRY.history()};}

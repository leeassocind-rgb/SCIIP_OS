/** SCIIP_OS v7.0 Sprint 3F — immutable audit trail. */
var SCIIP_AUDIT_TRAIL=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3f',entries=[],byKey={},nextId=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function text_(v){return String(v==null?'':v).trim();}
  function append(input){input=input||{};var key=text_(input.businessKey);if(!key)throw new Error('AUDIT_BUSINESS_KEY_REQUIRED');if(byKey[key])return clone_(byKey[key]);var e={auditId:'audit-'+nextId++,businessKey:key,eventType:text_(input.eventType||'GENERAL'),actor:text_(input.actor||'SYSTEM'),entityId:text_(input.entityId),workspace:text_(input.workspace),payload:clone_(input.payload||{}),timestamp:input.timestamp||new Date().toISOString(),immutable:true};entries.push(e);byKey[key]=e;return clone_(e);}
  function list(filter){filter=filter||{};return clone_(entries.filter(function(e){return (!filter.eventType||e.eventType===filter.eventType)&&(!filter.entityId||e.entityId===filter.entityId)&&(!filter.workspace||e.workspace===filter.workspace);}));}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',count:entries.length,entries:clone_(entries)};}
  function reset(){entries=[];byKey={};nextId=1;return true;}
  return {VERSION:VERSION,append:append,list:list,snapshot:snapshot,reset:reset};
})();
function sciipAuditTrailAppendV7(input){return SCIIP_AUDIT_TRAIL.append(input||{});}
function sciipAuditTrailSnapshotV7(){return SCIIP_AUDIT_TRAIL.snapshot();}
